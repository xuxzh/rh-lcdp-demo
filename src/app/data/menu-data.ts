import { RhLoginedUserDto, RhMenusDto } from 'rh-base/model';
export const DEFAULT_USER: RhLoginedUserDto = {
  UserId: 10,
  UserName: 'admin',
  DisplayName: 'admin',
  FactoryCode: 'RuiHui',
  UserSessionId: 10086,
  login: true,
  locked: false
};

export const DEFAULT_MENU_DATAS: RhMenusDto[] = [
  {
    Name: 'RH_Root',
    DisplayName: '测试项目',
    ParentId: '-1',
    Icon: 'setting',
    Url: '$lcdp:aaa',
    LevelLayer: 2,
    SortOrder: 100,
    TargetView: '',
    CustomData: null,
    IsEnable: 1,
    IsVisible: 1,
    IsUseFeaturePermission: false,
    isRefresh: false,
    select: false,
    ProductName: 'MES',
    OpSign: 1,
    IdKey: 'root_key',
    Id: 100
  },
  {
    Name: 'RH_LcdpOne',
    DisplayName: '测试菜单一',
    ParentId: 'root_key',
    Icon: 'experiment',
    Url: '$lcdp:bbb',
    LevelLayer: 2,
    SortOrder: 100,
    TargetView: '',
    CustomData: null,
    IsEnable: 1,
    IsVisible: 1,
    IsUseFeaturePermission: false,
    isRefresh: false,
    select: false,
    ProductName: 'MES',
    OpSign: 1,
    IdKey: 'lcdp_one_key',
    Id: 100
  },
  {
    Name: 'RH_LcdpTwo',
    DisplayName: '测试菜单二',
    ParentId: 'root_key',
    Icon: 'experiment',
    Url: 'LcdpTwo',
    LevelLayer: 2,
    SortOrder: 99,
    TargetView: '',
    CustomData: null,
    IsEnable: 1,
    IsVisible: 1,
    IsUseFeaturePermission: false,
    isRefresh: false,
    select: false,
    ProductName: 'MES',
    OpSign: 1,
    IdKey: 'lcdp_two_key',
    Id: 99
  }
];
