using CourseService.CourseService.Dtos;
using CourseService.CourseService.Entities;
using CourseService.CourseService.Extensions;
using CourseService.CourseService.Repositories.CourseRepository;
using CourseService.CourseService.Repositories.VideoRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace CourseService.CourseService.CourseController
{

    [ApiController]
    [Route("[controller]")]
    public class CourseController : ControllerBase
    {
        private readonly CourseRepository _courseRepository;
        private readonly VideoRepository _videoRepository;
        private readonly ILogger<CourseController> _logger;

        public CourseController(ILogger<CourseController> logger, CourseRepository coursesRepository, VideoRepository videoRepository)
        {
            _logger = logger;
            _courseRepository = coursesRepository;
            _videoRepository = videoRepository;

        }



        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetAsync()
        {
            var courses = await _courseRepository.GetAllAsync();
            var courseDtos = courses.Select(course => course.AsDto()).ToList(); // AsDto extension metodunu kullanarak dönüştürme
            _logger.LogInformation("Getting all courses");
            return Ok(courseDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CourseDto>> GetById(Guid id)
        {
            var course = await _courseRepository.GetAsync(id);
            if (course == null)
            {
                _logger.LogError("Get course error with id" + id);
                return NotFound();
            }

            var courseDto = course.AsDto(); // AsDto extension metodunu kullanarak dönüştürme
            return Ok(courseDto);
        }

        [HttpPost]
        [Authorize(Policy = "IsTeacher")]
        public async Task<ActionResult<CourseDto>> CreateAsync(CreateCourseDto createCourseDto)
        {
            var newCourse = new Course
            {
                Id = Guid.NewGuid(),
                Name = createCourseDto.Name,
                Description = createCourseDto.Description,
                Price = createCourseDto.Price,
                Teacher = "New Teacher", // Bu kısmı dinamik olarak ayarlamayı düşünebilirsiniz
            };

            await _courseRepository.CreateAsync(newCourse);
            var courseDto = newCourse.AsDto();
            return CreatedAtAction(nameof(GetById), new { id = newCourse.Id }, courseDto);

        }
        // Öğrenciler için kurslara kayıt olma
        [HttpPost("{courseId}/enroll")]
        [Authorize(Policy = "IsStudent")]
        public Task<IActionResult> EnrollInCourse(int courseId)
        {
            // Kurs kayıt işlemleri...
            return Task.FromResult<IActionResult>(Ok());
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutAsync(Guid id, UpdateCourseDto updateCourseDto)
        {
            var course = await _courseRepository.GetAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            course.Name = updateCourseDto.Name;
            course.Description = updateCourseDto.Description;
            course.Price = updateCourseDto.Price;
            course.VideoIds = updateCourseDto.VideoIds;

            await _courseRepository.UpdateAsync(course);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            var course = await _courseRepository.GetAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            await _courseRepository.RemoveAsync(id);
            return NoContent();
        }

        /*
        UploadVideoAsync metodu videoyu GridFS'ye kaydeder ve kaydedilen video için bir ObjectId döndürür. 
        Bu ObjectId, ToString metodu kullanılarak string bir değere dönüştürülür 
        ve kursun VideoIds listesine eklenir.
         Son olarak, kurs nesnesi güncellenir ve değişiklikler veritabanına kaydedilir.
         */

        [HttpPost("{courseId}/upload-video")]
        public async Task<IActionResult> UploadVideo(Guid courseId, IFormFile videoFile)
        {
            var course = await _courseRepository.GetAsync(courseId);
            if (course == null)
            {
                return NotFound("Course not found");
            }

            using (var stream = videoFile.OpenReadStream())
            {
                var videoId = await _videoRepository.UploadVideoAsync(videoFile.FileName, stream);
                course.VideoIds.Add(videoId.ToString());
                await _courseRepository.UpdateAsync(course);
            }

            return Ok(new { VideoId = course.VideoIds.LastOrDefault() });
        }
        [HttpDelete("{courseId}/delete-video/{videoId}")]
        public async Task<IActionResult> DeleteVideo(Guid courseId, string videoId)
        {
            var course = await _courseRepository.GetAsync(courseId);
            if (course == null || !course.VideoIds.Contains(videoId))
            {
                return NotFound("Course or video not found");
            }

            // ObjectId'ye dönüştürme
            if (!ObjectId.TryParse(videoId, out var objectId))
            {
                return BadRequest("Invalid video ID");
            }

            await _videoRepository.DeleteVideoAsync(objectId);
            course.VideoIds.Remove(videoId);
            await _courseRepository.UpdateAsync(course);

            return NoContent();
        }


    }

}