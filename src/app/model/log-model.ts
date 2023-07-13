import { OpResultT, RhLoginedUserDto, RhSafeAny } from 'rh-base/model';

// export class ConfigLogDto {
//   public __req: string;
//   public __res: string;
//   public __setupData?: string;
//   public OpSign?: number;
// }
export class ConfigLogDto {
  public __req!: Request;
  public __res!: OpResultT<RhSafeAny>;
  public __setupData?: RhSetupData;
  public OpSign?: number;
}

export class RhSetupData {
  public routerUrl!: string;
  public userInfo!: RhLoginedUserDto;
  public factoryCode!: string;
  [prop: string]: RhSafeAny;
}
