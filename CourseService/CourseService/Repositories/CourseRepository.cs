using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using CourseService.CourseService.Entities;

namespace CourseService.CourseService.Repositories.CourseRepository
{
    public class CourseRepository
    {
        private const string collectionName = "courses";
        private readonly IMongoCollection<Course> dbCollection;
        private readonly FilterDefinitionBuilder<Course> filterBuilder = Builders<Course>.Filter;

        public CourseRepository(IMongoDatabase database)
        {
            dbCollection = database.GetCollection<Course>(collectionName);
        }

        //Koleksiyondaki tüm Course nesnelerini asenkron olarak döndürür.
        public async Task<IReadOnlyCollection<Course>> GetAllAsync()
        {
            return await dbCollection.Find(filterBuilder.Empty).ToListAsync();
        }
        // Belirli bir idye sahip Course nesnesini asenkron olarak döndürür.
        public async Task<Course> GetAsync(Guid id)
        {
            FilterDefinition<Course> filter = filterBuilder.Eq(entity => entity.Id, id);
            return await dbCollection.Find(filter).FirstOrDefaultAsync();

        }
        //Yeni bir Course nesnesini asenkron olarak koleksiyona ekler.
        public async Task CreateAsync(Course entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }
            await dbCollection.InsertOneAsync(entity);
        }
        //Var olan bir Course nesnesini asenkron olarak günceller.
        public async Task<bool> UpdateAsync(Course entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            FilterDefinition<Course> filter = filterBuilder.Eq(existingEntity => existingEntity.Id, entity.Id);

            var result = await dbCollection.ReplaceOneAsync(filter, entity);
            return result.IsAcknowledged && result.ModifiedCount > 0;

        }
        //Belirli bir idye sahip Course nesnesini asenkron olarak koleksiyondan siler.
        public async Task RemoveAsync(Guid id)
        {
            FilterDefinition<Course> filter = filterBuilder.Eq(entity => entity.Id, id);
            await dbCollection.DeleteOneAsync(filter);

        }
 
    }
}
