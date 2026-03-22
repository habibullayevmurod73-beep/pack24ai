import Fefco0201 from '../components/models/Fefco0201';
import Fefco0427 from '../components/models/Fefco0427';
import { BoxModel } from './types';

import PizzaBox from '../components/models/PizzaBox';

export const availableModels: BoxModel[] = [
    Fefco0201,
    Fefco0427,
    PizzaBox
];

export const defaultModel = availableModels[0];
