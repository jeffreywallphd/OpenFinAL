import { LearningModule } from '../../Entity/LearningModule';

describe('LearningModule class', () => {
    it('should fill the fields Map with the default values', () => {
        const learningModule = new LearningModule();

        expect(learningModule.fields.size).toBe(9); // 9 fields currently exist in the file

        for(var key in learningModule.fields) {
            expect(learningModule.fields[key]).toBeNull(); // all fields default to null
        }
    });

    it('should fill the key with the appropriate value using setFieldValue', () => {
        const learningModule = new LearningModule();
        learningModule.setFieldValue("key", "123");
        
        expect(learningModule.fields.get("key").value).toBe("123"); 
    });

    it('should fill the fields with the data from a requestModel', () => {
        // Set up mock requestModel
        const date = new Date();
        const requestModel = {
            request: {
                request: {
                    learningModule: {
                        id: '42',
                        title: 'Test Module',
                        description: "test description",
                        keywords: 'test, learning',
                        timeEstimate: 60,
                        dateCreated: date
                    },
                },
            }
        };

        const learningModule = new LearningModule();
        learningModule.fillWithRequest(requestModel);

        expect(learningModule.fields.get("id").value).toBe('42');
        expect(learningModule.fields.get("title").value).toBe('Test Module');
        expect(learningModule.fields.get("description").value).toBe("test description");
        expect(learningModule.fields.get("keywords").value).toBe('test, learning');
        expect(learningModule.fields.get("timeEstimate").value).toBe(60);
        expect(learningModule.fields.get("dateCreated").value).toBe(date);
    });

    it('should throw an error for non-existent learningModule object in requestModel', () => {
        const date = new Date();
        const requestModel = {
            request: {
                request: {
                    id: '42',
                    title: 'Test Module',
                    description: "test description",
                    keywords: 'test, learning',
                    timeEstimate: 60,
                    dateCreated: date
                },
            }
        };

        const learningModule = new LearningModule();
        expect(() => learningModule.fillWithRequest(requestModel)).toThrow("Making a request about a learning module requires a learningModule property");
    });

    it('should throw an error for non-existent field key', () => {
        const learningModule = new LearningModule();
        expect(() => learningModule.setFieldValue('invalidField', 'value')).toThrow('The requested data property does not exist.');
    });

    it('should getFields from the fields Map', () => {
        const learningModule = new LearningModule();
        learningModule.setFieldValue("key", "123");
        
        expect(learningModule.getFields()).toEqual(learningModule.fields); 
    });

    it('should getId from the fields Map', () => {
        const learningModule = new LearningModule();
        const id = "123";
        learningModule.setFieldValue("id", id);
        
        expect(learningModule.getId()).toBe(id); 
    });
});
