import * as https from 'https';
https.globalAgent.options.rejectUnauthorized = false;

type ResponseType = any;

export default function getOperatorNameByNumber(phoneNumber: string): Promise<string | null> {
  if (typeof phoneNumber !== 'string') {
    throw new Error('GMON: phoneNumber format error. It should be passed as a string.');
  }

  return performRequest(phoneNumber).then(
    (response) => {
      const regex = new RegExp(`<b>${phoneNumber}<\/b>(.*)<\/b>`);
      const match = response.match(regex);

      if (match && match[1]) {
        return match[1];
      }

      return null;
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
