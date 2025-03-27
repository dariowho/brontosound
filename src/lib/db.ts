import "reflect-metadata"
import { DataSource, Repository, type EntityTarget } from "typeorm"
import { Song, SongTag } from "$lib/dbEntities/song"
import { StoredDirectory, StoredFile, StoredObject } from "./dbEntities/storage";
import { LiveGig, LiveGigInteraction, LiveVenue, LiveVenueAddress } from "./dbEntities/live";
import { User } from "./dbEntities/user";
import { Contact } from "./dbEntities/contacts";
import { instanceToPlain, plainToClass, type ClassConstructor } from "class-transformer";

class TypeOrm {
  private static instance: Promise<DataSource> | null = null;

  private constructor() {
    // Private constructor to prevent external instantiation
  }

  public static getDb(): Promise<DataSource> {
    if (!TypeOrm.instance) {
      TypeOrm.instance = new DataSource({
          type: "sqlite",
          database: "data/database/database.sqlite", // TODO: use a config file
          entities: [
            User,
            Song,
            SongTag,
            StoredObject,
            StoredDirectory,
            StoredFile,
            Contact,
            LiveVenue,
            LiveVenueAddress,
            LiveGig,
            LiveGigInteraction,
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

  public static async saveEntity<Type>(entityCls: ClassConstructor<Type>, entity: Promise<object> | object | string, overrideProperties: Record<string, any>=null): Promise<Type> {
      if (typeof entity === 'string') {
          entity = JSON.parse(entity);
      }
      const [entityObject, db] = await Promise.all([
          await entity,
          await TypeOrm.getDb(),
      ]);
      if (overrideProperties) {
        Object.entries(overrideProperties).forEach(([key, value]) => {
          entityObject[key] = value;
        });
      }
      const newEntity = plainToClass(entityCls, entityObject);
      return db.manager.save(newEntity);
  }
}
export default TypeOrm;

export async function saveEntityViaApi<Type>(entityCls: ClassConstructor<Type>, entityObject: Type, endpoint: string): Promise<Type> {
  const body = entityObject instanceof entityCls ? instanceToPlain(entityObject) : entityObject;
  const res = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    // TODO: test
    console.error("Failed to save entity:", res);
    throw new Error("Failed to save entity: " + res.statusText);
  }

  const jsonResponse = await res.json();
  let result = plainToClass(entityCls, jsonResponse);
  return result;
}
