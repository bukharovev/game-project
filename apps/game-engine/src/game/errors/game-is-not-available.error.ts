export class GameIsNotAvailable {
  baseType: string;
  domainType?: string;
  
  constructor() {
    this.baseType = 'INCORRECT_DATA'
    this.domainType = 'GAME_IS_NOT_AVAILABLE'
  }
}