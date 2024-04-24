import { InternalServerErrorExceptionFilter } from './internalServerError-exception.filter';

describe('InternalServerExceptionFilter', () => {
  it('should be defined', () => {
    expect(new InternalServerErrorExceptionFilter()).toBeDefined();
  });
});
