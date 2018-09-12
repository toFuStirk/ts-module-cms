import { HttpException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Any, In, Like, Repository } from "typeorm";
import { ArticleEntity } from "../../entity/article.entity";
import { ClassifyEntity } from "../../entity/classify.entity";
import { ImagePreProcessInfo } from "../common/error.interface";
import { MessageCodeError } from "../errorMessage/error.interface";
import { ClassifyService } from "./classify.service";
const _ = require("underscore");
let result;
@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity) private readonly respository: Repository<ArticleEntity>,
        @InjectRepository(ClassifyEntity) private readonly claRespository: Repository<ClassifyEntity>,
        private readonly classifyService: ClassifyService,
        @Inject("StoreComponentToken") private storeService,
    ) {
    }

    /**
     * 返回所有数据,依据提供limit进行分页
     * @returns {Promise<Array<ArticleEntity>>}
     */
    async getArticleAll(limit?: number, hidden?: boolean, pages?: number) {
        try {
            result = await this.respository.createQueryBuilder("article")
                .leftJoinAndSelect("article.classify", "classify")
                .where(" case when :hidden1::text <> '' then " +
                    " ( case when :hidden2 = true  " +
                    " then  \"article\".\"hidden\" = true and \"article\".\"recycling\" = true  " +
                    " else (\"article\".\"recycling\" = true and \"article\".\"hidden\" = false) end ) " +
                    " else (\"article\".\"recycling\" = false or \"article\".\"recycling\" is null) end ", {
                    hidden1: hidden ? hidden : undefined,
                    hidden2: hidden ? hidden : undefined
                })
                .orderBy("article.publishedTime", "DESC")
                .skip(limit * (
                    pages - 1
                ))
                .take(limit)
                .getManyAndCount();
        } catch (err) {
            throw new HttpException("getArticleAll:" + err.toString(), 404);
        }
        return { articles: result[0], totalItems: result[1] };
    }

    /**
     * 此处用于  搜索 资讯和活动 下分类的 文章
     * @param {string} name
     * @param {number} limit
     * @returns {Promise<Array<ArticleEntity>>}
     */
    async searchArticles(name: string, limit?: number, pages?: number) {
        const array: Array<number> = await this.classifyService.getClassifyIdForArt();
        if (array.length !== 0) {
            result = await this.respository.findAndCount({
                where: {
                    classifyId: In(array),
                    name: Like(`%${name ? name : ""}%`),
                    recycling: Any([false, undefined])
                },
                relations: ["classify"],
                order: {
                    publishedTime: "DESC"
                },
                skip: limit * (pages - 1),
                take: limit
            });
            return { articles: result[0], totalItems: result[1] };
        } else {
            const newArticles: Array<ArticleEntity> = [];
            return { articles: newArticles, totalItems: 0 };
        }

    }

    /**
     * 修改数据状态为回收站
     * @param {[number]} array
     * @returns {Promise<number>}
     */
    async deleteArticles(array: Array<number>){
        const articles: Array<number> = [];
        await this.respository.findByIds(array).then(a => { a.map((key, value) => {
             articles.push(key.id);
        })});
        const noExit = _.difference(array, articles);
        if( noExit.length > 0 ) {
            return {code: 405, message: `以下数据id=${noExit} 不存在`};
        }
        await this.respository.update(array,{ recycling: true });
        return {code: 200, message: "修改成功"};
    }

    /**
     * 添加文章
     * @param {ArticleEntity} article
     * @returns {Promise<void>}
     */
    async createArticle(req: any, article: ArticleEntity) {
        const entity: ClassifyEntity = await this.classifyService.findOneArt(article.classifyId);
        if (article.classifyId  &&  !entity) {
            throw new MessageCodeError("page:classify:classifyIdMissing");
        }
        const num: number = await this.classifyService.findLevel(article.classifyId);
        const level: string = this.classifyService.interfaceChange(num);
        if (!article.topPlace) {
            article.topPlace = "cancel";
        }
        const levelGive: string = article.topPlace;
        if (level === "level1" && levelGive === "level2" || levelGive === "level3") {
            throw new MessageCodeError("create:level:lessThanLevel");
        }
        if (level === "level2" && levelGive === "level3") {
            throw new MessageCodeError("create:level:lessThanLevel");
        }
        await this.respository.save(await this.respository.create(article));
    }

    /**
     * 修改文章
     * @param {ArticleEntity} article
     *
     * @returns {Promise<void>}
     */
    async updateArticle(req: any, article: ArticleEntity) {
        const art: ArticleEntity = await this.respository.findOne(article.id);
        if (art === null) { throw new MessageCodeError("delete:recycling:idMissing"); }
        const entity: ClassifyEntity = await this.classifyService.findOneArt(article.classifyId);
        if (article.classifyId && !entity) {
            throw new MessageCodeError("page:classify:classifyIdMissing");
        }
        const num: number = await this.classifyService.findLevel(article.classifyId);
        const level: string = this.classifyService.interfaceChange(num);
        const levelGive: string = article.topPlace;
        if (level === "level1" && levelGive === "level2" || levelGive === "level3") {
            throw new MessageCodeError("create:level:lessThanLevel");
        }
        if (level === "level2" && levelGive === "level3") {
            throw new MessageCodeError("create:level:lessThanLevel");
        }
        await this.respository.save(await this.respository.create(article));
    }

    /**
     * 分页获取回收站内所有文章
     * @param {number} limit
     * @returns {Promise<Array<ArticleEntity>>}
     */
    async recycleFind(limit?: number, pages?: number) {
        const result = await this.respository.findAndCount({
            where: { recycling: true},
            relations: ["classify"],
            order: { publishedTime: "DESC"},
            skip: limit * (pages - 1),
            take: limit
        });
        return { articles: result[0], totalItems: result[1] };
    }

    /**
     * 回收站内删除数据
     * @param {[number]} array
     * @returns {Promise<number>}
     */
    async recycleDelete(array: Array<number>) {
        try {
            const articles: Array<number> = [];
            await this.respository.findByIds(array).then(a => { a.map((key, value) => {
                articles.push(key.id);
            })});
            const noExit = _.difference(array, articles);
            if(noExit.length > 0) {
                return {code: 405, message: `以下数据id=${noExit} 不存在`};
            }
            await this.respository.delete(array);
        } catch (err) {
            throw new HttpException("删除错误" + err.toString(), 401);
        }
        return {code: 200, message: "删除成功"};
    }

    /**
     * 回收站内批量或者单个还原数据，目前限制分页为0
     * @param {[number]} array
     * @returns {Promise<Array<ArticleEntity>>}
     */
    async reductionArticle(array: Array<number>) {
        try {
            const articles: Array<number> = [];
            await this.respository.findByIds(array).then(a => { a.map((key, value) => {
                articles.push(key.id);
            })});
            const noExit = _.difference(array, articles);
            if(noExit.length > 0) {
                return {code: 405, message: `以下数据id=${noExit} 不存在`};
            }
            await this.respository.update(array, { recycling: false});
        } catch (err) {
            throw new HttpException("reductionArticle:" + err.toString(), 404);
        }
        return {code: 200 , message: "回收站还原成功"};
    }

    /**
     * 分批获取置顶文章
     * @param {number} limit
     * @returns {Promise<Array<ArticleEntity>>}
     */
    async findTopPlace(limit?: number, pages?: number) {
        result = await this.respository.findAndCount({
            relations: ["classify"],
            where: {topPlace: "global"},
            order: {publishedTime: "DESC"},
            skip: limit * (pages - 1),
            take: limit
        });
        return { articles: result[0], totalItems: result[1] };
    }

    /**
     * 回收站内根据分类查找当前分类及子分类下的文章
     * @param {number} id
     * @param {number} limit
     * @param {number} pages
     *
     * @returns {Promise<Array<ArticleEntity>>}
     */
    async reductionClassity(id: number, limit?: number, pages?: number) {
        const entity: ClassifyEntity = await this.classifyService.findOneArt(id);
        if (!entity) { throw new MessageCodeError("page:classify:classifyIdMissing"); }
        const array: Array<number> = await this.classifyService.getClassifyId(id);
        result = await this.respository.findAndCount({
            where: {
                classifyId: In(array),
                recycling: true
            },
            relations: ["classify"],
            order: {publishedTime: "DESC"},
            skip: limit * (pages - 1),
            take: limit
        });
        return { articles: result[0], totalItems: result[1] };
    }

    /**
     * 根据分类id获取层级
     * @param {number} id
     * @returns {Promise<string>}
     */
    async getLevelByClassifyId(id: number): Promise<string> {
        const entity: ClassifyEntity = await this.classifyService.findOneArt(id);
        if (entity === null) { throw new MessageCodeError("delete:recycling:idMissing"); }
        const num: number = await this.classifyService.findLevel(entity.id);
        const level: string = this.classifyService.interfaceChange(num);
        let topPlace = "";
        if (level === "level1") {
            topPlace = `global,current`;
        } else if (level === "level2") {
            topPlace = `global,level1,current`;
        } else if (level === "level3") {
            topPlace = `global,level1,current,level2`;
        } else {
            topPlace = `global,level1,level2,level3,current`;
        }
        return topPlace;
    }

    /**
     * 文章修改基本校验
     * @param {number} classifyId
     * @param {number} id
     * @returns {Promise<{MessageCodeError: string; Continue: boolean}>}
     * @constructor
     */
    async CurdArticleCheck(classifyId?: number, id?: number) {
        let result: string;
        let update = true;
        if (id > 0) {
            const aliasEntity: ArticleEntity = await this.respository.findOne({id});
            if (!aliasEntity) { result = "当前文章不存在"; }
            update = false;
        }
        if (classifyId > 0) {
            const entity: ClassifyEntity = await this.classifyService.findOneArt(classifyId);
            if (!entity) { result = "对应分类不存在"; }
            update = false;
        }
        if (!result) {
            update = true;
        }
        return { MessageCodeError: result, Continue: update };
    }

    /**
     * 上传图片
     * @param {string} bucketName
     * @param {string} rawName
     * @param {string} base64
     * @returns {Promise<{bucketName: string; name: string; type: string}>}
     */
    async upLoadPicture(req: any, bucketName: string, rawName: string, base64: string, id?: number) {
        try {
            if (id > 0) {
                const entity: ArticleEntity = await this.respository.findOne(id);
              /*  /!*删除图片*!/
                if (entity && entity.bucketName !== null && entity.pictureName !== null) {
                    const entitys: Array<ArticleEntity> = await this.respository.find({ pictureUrl: entity.pictureUrl });
                    if (entitys.length === 1) {
                        await this.storeService.delete(entity.bucketName, entity.pictureName, entity.type);
                    }
                }*/
            }
            const imagePreProcessInfo = new ImagePreProcessInfo();
            imagePreProcessInfo.watermark = false;
            /*上传图片*/
            const result = await this.storeService.upload(bucketName, rawName, base64, imagePreProcessInfo).then(a => {
                return a;
            });
            const map = this.objToStrMap(result);
            const bucket = map.get("bucketName");
            const name = map.get("name");
            const types = map.get("type");
            /*获取图片地址*/
            const url = await this.storeService.getUrl(
                req.get("obj"),
                bucket,
                name,
                types,
                imagePreProcessInfo,
            );

            return { pictureUrl: `https://${url}`, bucketName: bucket, pictureName: name, type: types, MessageCodeError: "上传成功" };
        } catch (err) {
            if (err instanceof  HttpException) {
                return { MessageCodeError: err.getStatus() + ":" + err.getResponse() };
            } else if (err instanceof  Error) {
                return { MessageCodeError: err.message + ":" + err.stack };
            } else {
                return { MessageCodeError: "未知错误" };
            }

        }
    }

    /**
     * JSON----Map
     * @param obj
     * @returns {Map<string, string>}
     */
    objToStrMap(obj): Map<string, string> {
        const strMap = new Map();
        for (const k of Object.keys(obj)) {
            strMap.set(k, obj[ k ]);
        }

        return strMap;
    }

    /**
     * 根据id获取文章
     * @param {number} id
     * @returns {Promise<ArticleEntity>}
     */
    async getArticleById(id: number) {
        const array: Array<ArticleEntity> = [];
        const article: ArticleEntity = await this.respository.findOne({where:{id: id}, relations: ["classify"]});
        if (!article) { throw new MessageCodeError("delete:recycling:idMissing"); }
        array.push(article);
        const last = await this.respository.createQueryBuilder()
            .where('"id" = (select max(id) from public.article_entity_table where "id" < :id and "classifyId" =:classifyId  limit 1) ',
                 {id, classifyId: article.classifyId}
                )
            .getOne();
        if (last) {
            last.classify = await this.claRespository.findOne({id: last.classifyId});
            array.push(last);
        }
        const next = await this.respository.createQueryBuilder()
            .where('"id" = (select min(id) from public.article_entity_table where "id" > :id and "classifyId" =:classifyId  limit 1) ',
                 {id, classifyId: article.classifyId}
                )
            .getOne();
        if (next) {
            next.classify = await this.claRespository.findOne({id: next.classifyId});
            array.push(next);
        }
        return { articles: array };
    }

}
