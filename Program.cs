var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/api/status", () => new
{
    Message = "Hello from the .NET backend API",
    Runtime = ".NET 8"
});

app.Run("http://localhost:5001");