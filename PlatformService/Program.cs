using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using MMLib.SwaggerForOcelot.DependencyInjection;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
builder.Configuration.AddJsonFile("ocelot.json");

// Ocelot servisleri
builder.Services.AddOcelot(builder.Configuration);

// SwaggerForOcelot servisini IServiceCollection'a ekleyin.
builder.Services.AddSwaggerForOcelot(builder.Configuration);

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("authservice", "Auth Service API");
        c.SwaggerEndpoint("courseservice", "Course Service API");
    });
}
app.UseCors();
app.UseOcelot().Wait();

app.UseHttpsRedirection();

app.Run();
