using CourseService.CourseService.Dtos;
using CourseService.CourseService.Entities;
using CourseService.CourseService.Extensions;
using CourseService.CourseService.Repositories.CourseRepository;
using CourseService.CourseService.Repositories.VideoRepository;
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

        public CourseController(CourseRepository coursesRepository, VideoRepository videoRepository)
        {
            _courseRepository = coursesRepository;
            _videoRepository = videoRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetAsync()
        {
            var courses = await _courseRepository.GetAllAsync();
            var courseDtos = courses.Select(course => course.AsDto()).ToList(); // AsDto extension metodunu kullanarak dönüştürme

            return Ok(courseDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CourseDto>> GetByIdAsync(Guid id)
        {
            var course = await _courseRepository.GetAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            var courseDto = course.AsDto(); // AsDto extension metodunu kullanarak dönüştürme
            return Ok(courseDto);
        }

        [HttpPost]
        public async Task<ActionResult<CourseDto>> CreateAsync(CreateCourseDto createCourseDto)
        {
            var newCourse = new Course
            {
                Id = Guid.NewGuid(),
                Name = createCourseDto.Name,
                Description = createCourseDto.Description,
                Price = createCourseDto.Price,
                Teacher = "New Teacher", // Bu kısmı dinamik olarak ayarlamayı düşünebilirsiniz
                VideoIds = createCourseDto.VideoIds
            };

            await _courseRepository.CreateAsync(newCourse);

            // DTO dönüş tipi oluşturulurken, video ID'leri de dahil edilmelidir.
            var courseDto = new CourseDto(newCourse.Id, newCourse.Name, newCourse.Description, newCourse.Price, newCourse.Teacher, newCourse.VideoIds);
            return CreatedAtAction(nameof(GetByIdAsync), new { id = newCourse.Id }, courseDto);
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

            await _videoRepository.DeleteVideoAsync(new ObjectId(videoId));
            course.VideoIds.Remove(videoId);
            await _courseRepository.UpdateAsync(course);

            return NoContent();
        }

    }

}