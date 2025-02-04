/* eslint-disable no-restricted-syntax */
import { Response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import FishLog from '../database/entities/fishLog';
import { connection } from '../database';
import { RequestWithUserRole } from '../Interface/fishLogInterfaces';
import coordenatesFake from '../utils/coordenatesFake';

dayjs.extend(utc);
const fishLogRepository = connection.getRepository(FishLog);

export default class FishController {
  createFishLog = async (req: RequestWithUserRole, res: Response) => {
    try {
      if (!(req.body.name || req.body.species || req.body.photo)) {
        return res.status(400).json({
          message:
            'Registro não foi criado, é necessário o nome, a espécie ou a foto para a criação de um registro.',
        });
      }

      req.body.coordenatesFake = {
        latitude: coordenatesFake(req.body.coordenates.latitude),
        longitude: coordenatesFake(req.body.coordenates.longitude),
      };
      req.body.visible = false;
      req.body.createdBy = req.user?.id;

      if (req.body.date && req.body.hour) {
        const date = req.body.date.split('/');
        req.body.createdAt = dayjs(
          `${date[2]}-${date[1]}-${date[0]} ${req.body.hour}`
        ).toDate();
      } else {
        req.body.createdAt = dayjs();
      }

      const fish = await fishLogRepository.save({
        id: uuidV4(),
        ...req.body,
      });
      delete fish.updatedAt;
      delete fish.createdAt;
      delete fish.createdBy;
      delete fish.visible;
      delete fish.coordenatesFake;
      return res.status(200).json({ fish });
    } catch (error) {
      return res.status(500).json({
        message: 'Falha no sistema de criação de registro, tente novamente!',
      });
    }
  };

  getAllFishLogs = async (req: RequestWithUserRole, res: Response) => {
    try {
      const allFishLogs = await fishLogRepository.find({
        where: [{ createdBy: req.user?.id }, { visible: true }],
      });

      for (const data of allFishLogs) {
        data.coordenates = data.coordenatesFake;
        delete data.coordenatesFake;
      }

      return res.status(200).json(allFishLogs);
    } catch (error) {
      return res.status(500).json({
        message: 'Falha ao processar requisição',
      });
    }
  };

  getAllFishLogsAdmin = async (req: RequestWithUserRole, res: Response) => {
    try {
      let allFishLogs: FishLog[] = [];
      if (req.user?.admin || req.user?.superAdmin) {
        allFishLogs = await fishLogRepository.find();
      } else {
        allFishLogs = await fishLogRepository.find({
          where: [{ createdBy: req.user?.id }, { visible: true }],
        });

        for (const data of allFishLogs) {
          data.coordenates = data.coordenatesFake;
          delete data.coordenatesFake;
        }
      }

      return res.status(200).json(allFishLogs);
    } catch (error) {
      return res.status(500).json({
        message: 'Falha ao processar requisição',
      });
    }
  };

  getOneFishLog = async (req: RequestWithUserRole, res: Response) => {
    try {
      const { id } = req.params;
      const fishLog = await fishLogRepository.findOne({ where: { id } });
      if (
        req.user?.admin ||
        fishLog?.createdBy === req.user?.id ||
        req.user?.superAdmin
      ) {
        return res.status(200).json(fishLog);
      }

      if (!fishLog) {
        return res.status(404).json({
          message: 'Relatório não encontrado',
        });
      }

      return res.status(401).json({
        message: 'Você não tem permissão para ver esse registro',
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Falha ao processar requisição',
      });
    }
  };

  updateFishLog = async (req: RequestWithUserRole, res: Response) => {
    try {
      const logId = req.params.id;
      const fishLog = await fishLogRepository.findOne({
        where: { id: logId },
      });

      const newFishLog = req.body;

      if (!fishLog) {
        return res.status(404).json({
          message: 'Relatório não encontrado',
        });
      }
      if (
        req.user?.admin ||
        req.user?.superAdmin ||
        fishLog?.createdBy === req.user?.id
      ) {
        try {
          if (!(req.body.name || req.body.species || req.body.photo)) {
            return res.status(400).json({
              message:
                'É necessário ao menos informar foto, espécie ou nome do peixe',
            });
          }

          await fishLogRepository.update({ id: logId }, { ...newFishLog });

          return res.status(200).json({
            message: 'Registo atualizado com sucesso!',
          });
        } catch (error) {
          return res.status(500).json({
            message: 'Falha ao atualizar o registro. Tente novamente',
          });
        }
      } else {
        return res.status(401).json({
          message: 'Você não tem permissão para ver esse registro',
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: 'Falha ao processar requisição',
      });
    }
  };

  deleteFishLog = async (req: RequestWithUserRole, res: Response) => {
    try {
      const logId = req.params.id;

      const fishLog = await fishLogRepository.findOne({
        where: { id: logId },
      });

      if (!fishLog) {
        return res.status(404).json({
          message: 'Relatório não encontrado',
        });
      }

      if (
        req.user?.admin ||
        req.user?.superAdmin ||
        fishLog?.createdBy === req.user?.id
      ) {
        try {
          await fishLogRepository.remove(fishLog);
          return res.status(200).json({
            message: 'Registo deletado com sucesso!',
          });
        } catch (error) {
          return res.status(500).json({
            message: 'Falha ao deletar o registro. Tente novamente',
          });
        }
      } else {
        return res.status(401).json({
          message: 'Você não tem permissão para deletar esse registro',
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: 'Falha ao processar requisição',
      });
    }
  };
}
