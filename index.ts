import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const TIMEOUT = 50;

const asyncWrapper = (cb: any) => (req: any, res: any, next: any) => cb(req, res, next).catch(next);

const Doors = {
  floor: process.env.DOOR_FLOOR,
  street: process.env.DOOR_STREET,
};

const openDoor = async (door: keyof typeof Doors) => {
  try {
    await axios.post(`https://api.nuki.io/smartlock/${Doors[door]}/action/unlock`, undefined, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NUKI_TOKEN}`,
      },
    });

    console.log('Door opened:', door);
  } catch (error) {
    console.error('Error opening door:', door);
    if(axios.isAxiosError(error)) {
      console.error(error.message);
    }
  }
};


const app = express();

app.get('/', asyncWrapper(async (req: express.Request, res: express.Response) => {
  const door = req.query.door as keyof typeof Doors | undefined;
  const timeout = req.query.timeout as number | undefined;

  const { authorization } = req.headers;

  if (authorization !== process.env.API_AUTH) {
    return res.status(401).send('Unauthorized');
  }

  if (door && Doors[door]) {
    await openDoor(door);
    return res.status(200).end();
  }

  // open booth doors with a timeout
  await openDoor('street');
  const time = timeout ? Number(timeout) : TIMEOUT;
  setTimeout(() => openDoor('floor'), time * 1000);
  return res.status(200).end();

}));

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server running on port: ${process.env.PORT || 8080}`);
});