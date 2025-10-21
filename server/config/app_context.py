from db.mongo import MongoDb


class AppContext:
    _instance = None
    mongo_db: MongoDb = None

    @staticmethod
    def get_instance():
        if AppContext._instance is None:
            AppContext._instance = AppContext()
        return AppContext._instance

    def get_mongodb(self):
        if self.mongo_db is None:
            raise ValueError(f"Mongodb is not initialized in app context")
        
        return self.mongo_db

def get_instance():
    return AppContext().get_instance()

def get_mongodb():
    return get_instance().get_mongodb()
