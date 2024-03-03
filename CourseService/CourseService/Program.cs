using MongoDB.Driver;
using CourseService.CourseService.Repositories;
using CourseService.CourseService.Repositories.VideoRepository;
using CourseService.CourseService.Repositories.CourseRepository;
var builder = WebApplication.CreateBuilder(args);
var mongoClient = new MongoClient(builder.Configuration["MongoDbSettings:ConnectionString"]);
var database = mongoClient.GetDatabase(builder.Configuration["MongoDbSettings:DatabaseName"]);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
builder.Services.AddSingleton<IMongoDatabase>(database);
builder.Services.AddScoped<CourseRepository>();
builder.Services.AddScoped<VideoRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.MapControllers();



app.Run();
