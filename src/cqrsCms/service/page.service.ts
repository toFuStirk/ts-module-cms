import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Like, Not, Repository } from "typeorm";
import { PageContentEntity } from "../../entity/page.content.entity";
import { PageEntity } from "../../entity/page.entity";
import { PageClassifyEntity } from "../../entity/pageClassify.entity";
import { MessageCodeError } from "../errorMessage/error.interface";
import { ClassifyService } from "./classify.service";
const _ = require("underscore");

let result;
@Injectable()
export class PageService {
    constructor(
        @InjectRepository(PageEntity) private readonly repository: Repository<PageEntity>,
        private readonly classifyService: ClassifyService,
        @InjectRepository(PageContentEntity) private readonly contentRepository: Repository<PageContentEntity>,
        @InjectRepository(PageClassifyEntity) private readonly pageRepository: Repository<PageClassifyEntity>,
    ) {
    }

    /**
     * 获取所有页面
     * @returns {Promise<Array<PageEntity>>}
     */
    async getAllPage(limit?: number, page?: number, keywords?: string) {
        result = await this.repository.findAndCount({
            relations: ["classify", "contents"],
            where: {title: Like(`%${keywords ? keywords : ""}%`)},
            order: {updateAt: "DESC"},
            skip: limit * (page - 1),
            take: limit
        });
        return { pages: result[0], totalItems: result[1] };
    }

    /**
     * 批量或者单个删除页面
     * @param {Array<number>} array
     * @returns {Promise<number>}
     */
    async deletePages(array: Array<number>) {
        const pages: Array<number> = [];
        await this.repository.findByIds(array).then(a => { console.log("结果是", a[0]);a.forEach((key, value) => {
            pages.push(key.id);
        })});
        const noExit = _.difference(array, pages);
        if( noExit.length > 0) {
            return {code: 405, message: `以下数据id=${noExit} 不存在`};
        }
        await this.repository.delete(array);
        return {code: 200, message: "删除成功"};
    }

    /**
     * 新增页面,别名不能重复
     * @param {PageEntity} page
     * @returns {Promise<Array<PageEntity>>}
     */
    async createPages(page: PageEntity, contents: Array<PageContentEntity>) {
        const entity: PageClassifyEntity = await this.classifyService.findOnePage(page.classifyId);
        if (page.classifyId && !entity) {
            throw new MessageCodeError("page:classify:classifyIdMissing");
        }
        const count = await this.repository.count({alias: page.alias});
        if (count > 0) { throw new MessageCodeError("create:classify:aliasRepeat"); }
        page.contents = contents;
        await this.repository.save(await this.repository.create(page));
    }

    /**
     * 基本校验
     * @param {string} alias
     * @param {number} classifyId
     * @returns {Promise<void>}
     */
    async curdCheck(aliasName?: string, classifyId?: number) {
        let result: string;
        let update = true;
        if (aliasName) {
            const count = await this.repository.count({alias: aliasName});
            if (count > 0) { result = "别名不能重复"; }
            update = false;
        }
        if (classifyId) {
            const entity: PageClassifyEntity = await this.classifyService.findOnePage(classifyId);
            if (!entity) { result = "对应分类不存在"; }
            update = false;
        }
        if (!result) {
            update = true;
        }
        return { MessageCodeError: result, Continue: update };
    }

    /**
     * 修改页面,别名不可重复
     * @param {PageEntity} page
     *
     * @returns {Promise<Array<PageEntity>>}
     */
    async updatePages(page: PageEntity, content: Array<PageContentEntity>) {
        const entityPage: PageEntity = await this.repository.findOne({id: page.id});
        if (!entityPage) {
            throw new MessageCodeError("delete:page:delete");
        }
        const count = await this.repository.count({
            alias: page.alias,
            id: Not(page.id)
        });
        if (count > 0) {
            throw new MessageCodeError("create:classify:aliasRepeat");
        }
        const entity: PageClassifyEntity = await this.classifyService.findOnePage(page.classifyId);
        if (page.classifyId && !entity) {
            throw new MessageCodeError("page:classify:classifyIdMissing");
        }
        try {
            await this.repository.save(await this.repository.create(page));
        } catch (error) {
            throw new MessageCodeError("dataBase:curd:error");
        }
        return {code: 200, message: "修改成功"};
    }

    /**
     * 根据id查找页面及对应内容
     * @param {number} id
     * @returns {Promise<PageEntity>}
     */
    async findPageById(id: number): Promise<PageEntity> {
        return this.repository.findOne(id, { relations: [ "contents", "classify" ] });
    }

    /**
     * 通过分类id查找页面
     * @param {number} id
     * @param {number} limit
     * @returns {Promise<Array<PageEntity>>}
     */
    async findPageByClassifyId(id: number, limit?: number, page?: number) {
        const entityClassify: PageClassifyEntity = await this.classifyService.findOnePageClassifyById(id);
        if (!entityClassify) { throw new MessageCodeError("delete:page:delete")}
        const array = await this.classifyService.getClassifyIdPage(id);
        result = await this.repository.findAndCount({
            where: {classifyId: In(array)},
            relations: ["classify", "contents"],
            order: {updateAt: "DESC"},
            skip: limit * (page - 1),
            take: page
        });
        return { pages: result[0], totalItems: result[1] };
    }
}
