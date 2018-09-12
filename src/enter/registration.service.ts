import { Component } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BlockEntity } from "../entity/block.entity";
import { SiteEntity } from "../entity/site.entity";
import { VisitEntity } from "../entity/visit.entity";

@Component()
export class RegistrationService {
    constructor(@InjectRepository(BlockEntity) private readonly blockRespository: Repository<BlockEntity>,
                @InjectRepository(SiteEntity) private readonly  siteRespository: Repository<SiteEntity>,
                @InjectRepository(VisitEntity) private readonly visitRespository: Repository<VisitEntity>) {
    }

    /*街区入驻*/
    async createBlock(block: BlockEntity) {
        let message: string;
        let code: number;
        try {
            block.collapse = false;
            await this.blockRespository.save(await this.blockRespository.create(block));
            message = "添加成功";
            code = 200;
        } catch (err) {
            message = "添加失败";
            code = 500;
        }
        return { MessageCodeError: message, Code: code };
    }

    /*场地租用*/
    async createSite(site: SiteEntity) {
        let message: string;
        let code: number;
        const time: Date = site.startTime;
        site.startTime = time;
        const newTime: Date = site.endTime;
        site.endTime = newTime;
        try {
            site.collapse = false;
            await this.siteRespository.save(await this.siteRespository.create(site));
            message = "添加成功";
            code = 200;
        } catch (err) {
            message = "添加失败";
            code = 500;
        }
        return { MessageCodeError: message, Code: code };
    }

    /*参观预约*/
    async createVisit(visit: VisitEntity) {
        let message: string;
        let code: number;
        try {
            visit.collapse = false;
            await this.visitRespository.save(await this.visitRespository.create(visit));
            message = "添加成功";
            code = 200;
        } catch (err) {
            message = "添加失败";
            code = 500;
        }
        return { MessageCodeError: message, Code: code };
    }

    /*获取街区入驻信息*/
    async getAllBlocks(limit?: number, pages?: number) {
        const result = await this.blockRespository.findAndCount({
            order: {id: "ASC"},
            skip: limit * (pages - 1),
            take: limit
        });
        return { blocks: result[0], totals: result[1] };
    }

    /*获取场地租用信息*/
    async getSite(limit?: number, pages?: number) {
        const result = await this.siteRespository.findAndCount({
            order: {id: "ASC"},
            skip: limit * (pages - 1),
            take: limit
        });
        return { sites: result[0], totals: result[1]};
    }

    /*获取参观预约信息*/
    async getVisit(limit?: number, pages?: number) {
        const result = await this.visitRespository.findAndCount({
            order: {id: "ASC"},
            skip: limit * (pages - 1),
            take: limit
        });
        return { visits: result[0], totals: result[1] };
    }

}
