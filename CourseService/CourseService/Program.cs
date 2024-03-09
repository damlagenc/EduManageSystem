using MongoDB.Driver;
using CourseService.CourseService.Repositories.VideoRepository;
using CourseService.CourseService.Repositories.CourseRepository;
using Serilog;


var builder = WebApplication.CreateBuilder(args);

// Serilog yapılandırması
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .WriteTo.File("log/courseLogs.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog(); // Serilog'u kullanmak için

var mongoClient = new MongoClient(builder.Configuration["MongoDbSettings:ConnectionString"]);
var database = mongoClient.GetDatabase(builder.Configuration["MongoDbSettings:DatabaseName"]);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// AuthService URL'sini yapılandırma dosyasından al
var authServiceBaseUrl = builder.Configuration.GetValue<string>("AuthServiceBaseUrl");



builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
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
