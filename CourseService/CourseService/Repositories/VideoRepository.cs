using MongoDB.Driver;
using MongoDB.Driver.GridFS;
using System;
using System.IO;
using System.Threading.Tasks;
using MongoDB.Bson;


namespace CourseService.CourseService.Repositories.VideoRepository
{
    public class VideoRepository
    {
        private readonly IGridFSBucket gridFSBucket;

        public VideoRepository(IMongoDatabase database)
        {
            gridFSBucket = new GridFSBucket(database, new GridFSBucketOptions
            {
                BucketName = "videos",
                ChunkSizeBytes = 1048576, // 1MB olarak ayarlanabilir.
            });
        }

        public async Task<ObjectId> UploadVideoAsync(string fileName, Stream videoStream)
        {
            return await gridFSBucket.UploadFromStreamAsync(fileName, videoStream);
        }

        public async Task<Stream> GetVideoAsync(ObjectId id)
        {
            return await gridFSBucket.OpenDownloadStreamAsync(id);
        }

        public async Task DeleteVideoAsync(ObjectId id)
        {
            await gridFSBucket.DeleteAsync(id);
        }
    }
}
