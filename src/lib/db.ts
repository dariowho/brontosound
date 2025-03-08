import "reflect-metadata"
import { DataSource, Repository, type EntityTarget } from "typeorm"
import { Song, SongTag } from "$lib/dbEntities/song"
import { StoredDirectory } from "./dbEntities/storage";

// export const AppDataSource = new DataSource({
//     type: "sqlite",
//     database: "database.sqlite",
//     entities: [
//         "src/lib/dbEntities/*.ts"
//     ],
//     synchronize: true,
//     logging: false,
// });


class TypeOrm {
    private static instance: Promise<DataSource> | null = null;
  
    private constructor() {
      // Private constructor to prevent external instantiation
    }
  
    public static getDb(): Promise<DataSource> {
      if (!TypeOrm.instance) {
        TypeOrm.instance = new DataSource({
            type: "sqlite",
            database: "database.sqlite", // TODO: use a config file
            entities: [ 
              Song,
              SongTag,
              StoredDirectory
            ],
            synchronize: true,
            logging: false,
        })
          .initialize()
          .then((fulfilled) => {
            console.info('Data Source has been initialized!');
            return fulfilled;
          })
          .catch((err) => {
            console.error('Error during Data Source initialization', err);
            return null;
          });
      }
      return TypeOrm.instance;
    }

    public static async getRepository<Type>(target: EntityTarget<Type>): Promise<Repository<Type>> {
        const db = await TypeOrm.getDb();
        return db.getRepository(target);
    }
  }
  
  export default TypeOrm;