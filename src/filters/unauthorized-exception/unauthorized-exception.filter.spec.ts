import { UnauthorizedExceptionFilter } from './unauthorized-exception.filter';

describe('UnauthorizedExceptionFilter', () => {
  it('should be defined', () => {
    expect(new UnauthorizedExceptionFilter()).toBeDefined();
  });
});
