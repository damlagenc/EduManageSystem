namespace CourseService.CourseService.Entities
{
    public class Course
    {

        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Teacher { get; set; }
        public List<string> VideoIds { get; set; } = new List<string>(); // Birden fazla video ID'si
    }

}