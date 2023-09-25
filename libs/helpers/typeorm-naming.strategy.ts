import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as StringUtils from 'typeorm/util/StringUtils';
import * as pluralize from 'pluralize';

export class TypeormNamingStrategy extends SnakeNamingStrategy {
  tableName(className: string, customName: string) {
    const words = StringUtils.snakeCase(className).split('_');
    words[words.length - 1] = pluralize.plural(words[words.length - 1]);
    return customName || words.join('_');
  }
}
