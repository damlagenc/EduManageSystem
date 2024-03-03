using CourseService.CourseService.Dtos;
using CourseService.CourseService.Entities;

namespace CourseService.CourseService.Extensions
{
    public static class Extensions
    {
        //AsDto metodunu, bir Course nesnesini CourseDto'ya dönüştürmek istediğiniz her durumda kullanılabilir. 
        //Ancak, her metod için bu dönüşümün gerekliliği, metodun işlevine ve geri dönüş değerlerine bağlıdır.
        public static CourseDto AsDto(this Course course)
        {
            return new CourseDto(course.Id, course.Name, course.Description, course.Price, course.Teacher, course.VideoIds);
        }
    }
}