using Microsoft.EntityFrameworkCore;
using TaskManagementAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS - Allow specific origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins",
        policy =>
        {
            policy.WithOrigins(
                    "https://www.themudking.com",
                    "http://www.themudking.com",
                    "https://themudking.com",
                    "http://themudking.com",
                    "http://localhost:3000"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Add Entity Framework
builder.Services.AddDbContext<TaskDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(5, 7, 0))
    ));

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowSpecificOrigins");
app.UseAuthorization();

// Add default route redirect
app.MapGet("/", () => Results.Redirect("/swagger"));

app.MapControllers();

app.Run();