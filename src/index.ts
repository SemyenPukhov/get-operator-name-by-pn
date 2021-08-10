import * as https from 'https';
https.globalAgent.options.rejectUnauthorized = false;

type ResponseType = any;

function hasLinkTag(str: string): boolean {
  return str.includes('</a>');
}

function isNumberCorrect(str: string): boolean {
  const regexp = new RegExp('s*[3489]s*[0-9]s*[0-9]s*[0-9]s*[0-9]s*[0-9]s*[0-9]s*[0-9]s*[0-9]s*[0-9]s*');
  return str.length === 10 && regexp.test(str);
}

export default function getOperatorNameByNumber(phoneNumber: string): Promise<string | null> {
  if (typeof phoneNumber !== 'string') {
    throw new Error('GMON: phoneNumber format error. It should be passed as a string');
  }

  if (!isNumberCorrect(phoneNumber)) {
    throw new Error('GMON: incorrect phone number');
  }

  return performRequest(phoneNumber).then(
    (response) => {
      const regex = new RegExp('(?<=Оператор: ).*?(?=<br>)');
      const match = response.match(regex);

      if (!match || !match[0]) {
        return null;
      }

      if (hasLinkTag(match[0])) {
        const reg = new RegExp('(<([^>]+)>)', 'gi');
        const operator = match[0].replace(reg, '');

        return operator || null;
      } else {
        return match[0];
      }
    },
    () => {
      return null;
    },
  );
}

function performRequest(phoneNumber: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(`https://zniis.ru/bdpn/check/?num=${phoneNumber}`, (resp: ResponseType) => {
        let data = '';
        resp.on('data', (chunk: string) => {
          data += chunk;
        });
        resp.on('end', () => {
          resolve(data);
        });
      })
      .on('error', (err: any) => {
        reject(err);
      });
  });
}
