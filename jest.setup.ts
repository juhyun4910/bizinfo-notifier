import '@testing-library/jest-dom';

jest.mock('next/link', () => require('./__mocks__/next/link').default);
