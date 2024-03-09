using System.ComponentModel.DataAnnotations;

namespace CourseService.CourseService.Entities
{
    public class Course
    {
        public Guid Id { get; set; }

        public required string Name { get; set; }
        public required string Description { get; set; }
        public decimal Price { get; set; }
        public required string Teacher { get; set; }
        public List<string> VideoIds { get; set; } = new List<string>(); // Birden fazla video ID'si
    }

}