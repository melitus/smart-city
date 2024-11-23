import { KafkaResponse, KafkaRequest } from '../interface';
import { isNil, isPlainObject, isObject, isString, isUndefined } from '../../../utils'

export const kafkaResponseDeserializer = (message: any): KafkaResponse => {
  const { key, value, timestamp, offset, headers } = message;
  let id = key;
  let response = value;

  if (Buffer.isBuffer(key)) {
    id = Buffer.from(key).toString();
  }

  if (Buffer.isBuffer(value)) {
    response = JSON.parse(Buffer.from(value).toString());
  }

  Object.keys(headers).forEach((key) => {
    if (Buffer.isBuffer(headers[key])) {
      headers[key] = Buffer.from(headers[key]).toString();
    }
  });
  return {
    key: id,
    response,
    timestamp,
    offset,
    headers,
  };
};

export const kafkaRequestSerializer = (value: any): KafkaRequest => {
  const isNotKafkaMessage = isNil(value) || !isObject(value) || (!('key' in value) && !('value' in value));

  if (isNotKafkaMessage) {
    value = { value };
  }
  value.value = encode(value.value);
  console.log({ encode: value });

  if (!isNil(value.key)) {
    value.key = encode(value.key);
  }
  if (isNil(value.headers)) {
    value.headers = {};
  }
  return value;
};

const encode = (value: any): Buffer | string | null => {
  const isObjectOrArray = !isNil(value) && !isString(value) && !Buffer.isBuffer(value);

  if (isObjectOrArray) {
    return isPlainObject(value) || Array.isArray(value) ? JSON.stringify(value) : JSON.parse(value.toString());
  } else if (isUndefined(value)) {
    return null;
  }
  return value;
};

export const generateUuid = ({ length } = { length: 20 }) =>
  [...Array(length)].map((_) => (~~(Math.random() * 36)).toString(36)).join('');
