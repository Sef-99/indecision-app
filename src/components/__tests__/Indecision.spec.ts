import { shallowMount } from '@vue/test-utils';
import {
  beforeEach,
  expect,
  it,
  vi,
  type MockInstance,
  afterEach,
} from 'vitest';
import Indecision from '../Indecision.vue';
import { describe } from 'node:test';

function mountComponent() {
  return shallowMount(Indecision);
}

let wrapper: ReturnType<typeof mountComponent>;
let clgSpy: MockInstance;
global.fetch = vi.fn().mockResolvedValue(
  createFetchResponse({
    answer: 'yes',
    forced: false,
    image: 'https://yesno.wtf/assets/yes/2.gif',
  })
);

function createFetchResponse(data: object) {
  return { json: () => new Promise((resolve) => resolve(data)) };
}

beforeEach(() => {
  wrapper = mountComponent();
  clgSpy = vi.spyOn(console, 'log');
  vi.clearAllMocks();
});

it('Should match with snapshot', () => {
  expect(wrapper.html()).toMatchSnapshot();
});

describe('tests in getAnswer', () => {
  it('Should call console log and getAnswer only one time', async () => {
    const getAnswerSpy = vi.spyOn(wrapper.vm, 'getAnswer');

    const input = wrapper.find('input');
    await input.setValue('Hola Mundo');

    expect(clgSpy).toHaveBeenCalled();
    expect(getAnswerSpy).not.toHaveBeenCalled();
  });

  it('Should call getAnswer function when the user inputs a ?', async () => {
    const getAnswerSpy = vi.spyOn(wrapper.vm, 'getAnswer');

    const input = wrapper.find('input');
    await input.setValue('Sere millonario?');

    expect(getAnswerSpy).toHaveBeenCalled();
  });

  it('should return the expected API response', async () => {
    await wrapper.vm.getAnswer();
    const img = wrapper.find('img');

    expect(img.exists()).toBeTruthy();
    expect(wrapper.vm.img).toBe('https://yesno.wtf/assets/yes/2.gif');
    expect(wrapper.vm.answer).toBe('Si');
  });

  it('should fail API in getAnswer', async () => {
    global.fetch = vi
      .fn()
      .mockImplementationOnce(() => Promise.reject('Error in API'));
    await wrapper.vm.getAnswer();
    const img = wrapper.find('img');

    expect(img.exists()).toBeFalsy();
    expect(wrapper.vm.answer).toBe('Fallo en el API');
  });
});
