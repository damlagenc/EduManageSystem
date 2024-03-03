using System;
using System.ComponentModel.DataAnnotations;

namespace CourseService.CourseService.Dtos
{
    public record CourseDto(Guid Id, string Name, string Description, decimal Price, string Teacher, List<string> VideoIds);
    public record CreateCourseDto([Required] string Name, string Description, [Range(0, 1000)] decimal Price, List<string> VideoIds);
    public record UpdateCourseDto([Required] string Name, string Description, [Range(0, 1000)] decimal Price, List<string> VideoIds);
}