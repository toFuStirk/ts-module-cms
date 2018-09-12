import { Mutation, Query, Resolver } from "@nestjs/graphql";
import { BlockEntity } from "../entity/block.entity";
import { SiteEntity } from "../entity/site.entity";
import { VisitEntity } from "../entity/visit.entity";
import { PagerService } from "../export/common.paging";
import { RegistrationService } from "./registration.service";
@Resolver()
export class EnterResolver {
    constructor(private readonly registration: RegistrationService,
                private readonly pagerService: PagerService) {
    }

    @Query("getAllVisits")
    async getAllVisits(obj, body: {limit: number, pages: number}) {
        const result = await this.registration.getVisit(body.limit, body.pages);
        const paging = this.pagerService.getPager(result.totals,  body.pages, body.limit);
        return { pagination: paging, visits: result.visits };
    }

    @Query("getAllSites")
    async getAllSites(obj, body: {limit: number, pages: number}) {
        const result = await this.registration.getSite(body.limit, body.pages);
        const paging = this.pagerService.getPager(result.totals,  body.pages, body.limit);
        return { sites: result.sites, pagination: paging };
    }

    @Query("getAllBlocks")
    async getAllBlocks(obj, body: {limit: number, pages: number}) {
        const result = await this.registration.getAllBlocks(body.limit, body.pages);
        const paging = this.pagerService.getPager(result.totals,  body.pages, body.limit);
        return { blocks: result.blocks, pagination: paging };
    }

    @Mutation("createBlocks")
    async createBlocks(obj, body: {block: BlockEntity}) {
        const result = await this.registration.createBlock(body.block);
        return JSON.stringify(result);
    }

    @Mutation("createSites")
    async createSites(obj, body: {site: SiteEntity }) {
        const site: SiteEntity = body.site;
        if (site.eventDate) {
            const date: string = site.eventDate.toString();
            site.eventDate = new Date(Date.parse(date.replace(/- /g, "/")));
        }
        if (site.startTime) {
            const date: string = site.startTime.toString();
            site.startTime = new Date(Date.parse(date.replace(/- /g, "/")));
        }
        if (site.endTime) {
            const date: string = site.endTime.toString();
            site.endTime = new Date(Date.parse(date.replace(/- /g, "/")));
        }
        const result = await this.registration.createSite(site);
        return JSON.stringify(result);
    }

    @Mutation("createVisits")
    async createVisits(obj, body: {visit: VisitEntity}) {
        const result = await this.registration.createVisit(body.visit);
        return JSON.stringify(result);
    }
}
