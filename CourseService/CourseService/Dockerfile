# Kullanılacak .NET SDK imajı
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# Proje dosyalarını kopyala
COPY *.csproj ./
RUN dotnet restore

# Tüm proje dosyalarını kopyala ve build et
COPY . ./
RUN dotnet publish -c Release -o out

# Çalışma zamanı imajı
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .
ENTRYPOINT ["dotnet", "CourseService.dll"]
