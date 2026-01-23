import { Request, Response } from "express";
import {
  approveValetService,
  rejectValetService,
  getValetsByGarageService,
} from "../services/valet.service";

import {
  getCompanyValetsService,
  getValetByIdService,
  getPendingValetsService,
} from "../services/valetDetail.service";
import { GetValetsByGarageQuery } from "../validators/valets.vzlidator";
import { ValetStatus } from "../entities/valets.entity";

// export const approveValetController
