import { InternalServerErrorExceptionFilter } from './intServerError-exception.filter';

describe('InternalServerExceptionFilter', () => {
  it('should be defined', () => {
    expect(new InternalServerErrorExceptionFilter()).toBeDefined();
  });
});
