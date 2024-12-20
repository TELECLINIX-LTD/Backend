import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

export function applyApiPropertyDecorators(dto: any) {
  Object.getOwnPropertyNames(new dto()).forEach((prop) => {
    const options: ApiPropertyOptions = {};
    const type = Reflect.getMetadata('design:type', dto.prototype, prop);
    if (type) {
      options.type = type;
    }
    ApiProperty(options)(dto.prototype, prop);
  });
}
