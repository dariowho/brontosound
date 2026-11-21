import "reflect-metadata"
import { DataSource, Repository, type DeepPartial, type EntityTarget } from "typeorm"
import { Song, SongTag } from "$lib/dbEntities/song"
import { StoredDirectory, StoredFile, StoredObject } from "./dbEntities/storage";
import { LiveGig, LiveGigInteraction, LiveVenue, LiveVenueLink, LiveVenueLocation } from "./dbEntities/live";
import { User, UserAccount, UserCreatedEntity } from "./dbEntities/user";
import { Contact } from "./dbEntities/contacts";
import { BacklineLink } from "./dbEntities/backline";
import { instanceToPlain, plainToClass, type ClassConstructor } from "class-transformer";

class TypeOrm {
  private static instance: Promise<DataSource> | null = null;

  private constructor() {
    // Private constructor to prevent external instantiation
  }

  public static getDb(): Promise<DataSource> {
    if (!TypeOrm.instance) {
      TypeOrm.instance = new DataSource({
          type: "better-sqlite3",
          database: "data/database/database.sqlite", // TODO: use a config file
          entities: [
            User,
            UserAccount,
            Song,
            SongTag,
            StoredObject,
            StoredDirectory,
            StoredFile,
            Contact,
            LiveVenue,
            LiveVenueLocation,
            LiveVenueLink,
            LiveGig,
            LiveGigInteraction,
            BacklineLink,
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

export async function saveEntityViaApi<Type>(entityCls: ClassConstructor<Type>, entityObject: Type | DeepPartial<UserCreatedEntity>, endpoint: string): Promise<Type> {
  const body = entityObject instanceof entityCls ? instanceToPlain(entityObject) : entityObject;
  const jsonResponse = await fetchApi(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return plainToClass(entityCls, jsonResponse) as Type;
}

/** Client-side fetch of an /api endpoint: returns the parsed JSON, throws with the server's error message */
export async function fetchApi(input: RequestInfo, init?: RequestInit): Promise<any> {
  const res = await fetch(input, init);
  const body = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error(body?.message ?? res.statusText);
  return body;
}
