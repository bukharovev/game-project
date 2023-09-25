export class GameNotFound {
  baseType: string;
  domainType?: string;
  
  constructor() {
    this.baseType = 'NOT_FOUND'
    this.domainType = 'GAME_NOT_FOUND'
  }
}