import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Any, getManager, In, Like, Not, Repository} from "typeorm";
import { ArticleEntity } from "../../entity/article.entity";
import { ClassifyEntity } from "../../entity/classify.entity";
import { PageEntity } from "../../entity/page.entity";
import { PageClassifyEntity } from "../../entity/pageClassify.entity";
import { MessageCodeError } from "../errorMessage/error.interface";
import { ClassifyInterface } from "../common/classify.interface";
let result;
@Injectable()
export class ClassifyService {
    constructor(
        @InjectRepository(ClassifyEntity) private readonly repository: Repository<ClassifyEntity>,
        @InjectRepository(ArticleEntity) private readonly artRepository: Repository<ArticleEntity>,
        @InjectRepository(PageClassifyEntity) private readonly pageRepository: Repository<PageClassifyEntity>,
        @InjectRepository(PageEntity) private readonly repositoryPage: Repository<PageEntity>,
    ) {
    }

    /**
     * 新增文章分类
     * @param {ClassifyEntity} entity
     * @param {string} parent
     * @returns {Promise<Array<ClassifyEntity>>}
     */
    async createClassifyArt(entity: ClassifyInterface) {
        try {
            const ignore = await this.repository.count();
            if (!entity.parentId && ignore <= 0) {
               await this.repository.save({title: entity.title, classifyAlias: entity.classifyAlias});
            }
            if (entity.parentId) {
                const parent = await this.repository.findOne({id: entity.parentId});
                if (!parent) {
                    return {code: 405, message: "当前分类父节点不存在"};
                }
                entity.parent = parent;
                await this.repository.save(this.repository.create(entity));
            }
        } catch (err) {
            throw new HttpException("createClassifyArt:" + err.toString(), 404);
        }
        return { code: 200, message: "创建成功" };
    }

    /**
     * 新增页面分类
     * @param {PageClassifyEntity} entity
     * @returns {Promise<Array<ClassifyEntity>>}
     */
    async createClassifyPage(entity: ClassifyInterface) {
        const ignore = await this.pageRepository.count();
        if (!entity.parentId && ignore <= 0) {
            await this.pageRepository.save(this.pageRepository.create(entity));
        } else {
            const count = await this.pageRepository.count({classifyAlias: entity.classifyAlias});
            /*别名不能重复*/
            if (count > 0) { throw new MessageCodeError("create:classify:aliasRepeat"); }
            const parentClassify: PageClassifyEntity = await this.pageRepository.findOne({id: entity.parentId});
            /*通过父级id确定父级是否存在*/
            if (!parentClassify) {
                throw new MessageCodeError("create:classify:parentIdMissing");
            }
            entity.parent = parentClassify;
            await this.pageRepository.save(this.pageRepository.create(entity));
        }
        return { code: 200, message: "创建成功" };
    }

    /**
     * 修改文章分类
     * @param {ClassifyEntity} entity
     * @returns {Promise<Array<ClassifyEntity>>}
     */
    async updateClassifyArt(entity: ClassifyInterface) {
        /*当前Id是否存在*/
        const classify: ClassifyEntity = await this.repository.findOne({id: entity.id});
        if (!classify) { throw new MessageCodeError("update:classify:update"); }
        if (entity.classifyAlias !== classify.classifyAlias) {
            const count = await this.repository.count({
                classifyAlias: entity.classifyAlias,
                id: Not(entity.id)
            });
            /*别名不能重复*/
            if (count > 0) { throw new MessageCodeError("create:classify:aliasRepeat"); }
        }
        if (entity.parentId && entity.parentId !== classify.parentId) {
            const parentClassify: ClassifyEntity = await this.repository.findOne({id: entity.parentId});
            /*通过父级别名确定父级是否存在*/
            if (!parentClassify) { throw new MessageCodeError("create:classify:parentIdMissing"); }
            entity.parent = parentClassify;
        }
        try {
            await this.repository.save(await this.repository.create(entity));
        } catch (err) {
            throw new HttpException("updateClassifyArt:" + err.toString(), 404 );
        }
       return { code: 200, message: "修改成功"};
    }

    /**
     * 修改页面分类
     * @param {PageClassifyEntity} entity
     * @returns {Promise<Array<ClassifyEntity>>}
     */
    async updateClassifyPage(entity: ClassifyInterface) {
        const classify: PageClassifyEntity = await this.pageRepository.findOne({id: entity.id});
        if (!classify) { throw new MessageCodeError("update:classify:update"); }
        if (entity.classifyAlias !== classify.classifyAlias) {
            const count = await this.pageRepository.count({
                classifyAlias: entity.classifyAlias,
                id: Not(entity.id)
            });
            /*别名不能重复*/
            if (count > 0) { throw new MessageCodeError("create:classify:aliasRepeat"); }
        }
        if (entity.parentId && entity.parentId !== classify.parentId) {
            const parentClassify: PageClassifyEntity = await this.pageRepository.findOne({id: entity.parentId});
            /*通过父级别名确定父级是否存在*/
            if (!parentClassify) { throw new MessageCodeError("create:classify:parentIdMissing"); }
            entity.parent = parentClassify;
        }
        await this.pageRepository.save(await this.pageRepository.create(entity));
    }

    /**
     * 查找文章所有分类
     * @param {number} id
     * @returns {Promise<Array<ClassifyEntity>>}
     */
    async findAllClassifyArt(idNum: number): Promise<Array<ClassifyEntity>> {
        let result: Array<ClassifyEntity> = [];
        try{
            const manage = getManager();
            if(idNum){
                const current = await this.repository.findOne({id: idNum});
                if(!current){
                    return ;
                }
              result.push(await manage.getTreeRepository(ClassifyEntity).findDescendantsTree(current));
            } else {
                result = await manage.getTreeRepository(ClassifyEntity).findTrees();
            }
        } catch (err){
            throw new HttpException("findAllClassifyArt:" + err.toString(), 404);
        }
        return result;
    }

    /**
     * 查找页面所有分类
     * @returns {Promise<Array<PageClassifyEntity>>}
     */
    async findAllClassifyPage(idNum: number): Promise<Array<PageClassifyEntity>> {
        let result: Array<PageClassifyEntity> = [];
        try{
            const manage = getManager();
            if (idNum) {
                const current = await this.pageRepository.findOne({id: idNum});
                if (!current) {
                    return ;
                }
                result.push(await manage.getTreeRepository(PageClassifyEntity).findDescendantsTree(current));
            } else {
                result = await manage.getTreeRepository(PageClassifyEntity).findTrees();
            }
        } catch (err) {
            throw new HttpException("findAllClassifyPage:" + err.toString(), 404);
        }
        return result;
    }

    /**
     * 删除文章分类对应的所有子级分类，如果子级分类下面有文章，则报错，不能删除
     * @param {number} id
     * @returns {Promise<Array<ClassifyEntity>>}
     */
    async deleteMethodFirst(id: number) {
        const classify: ClassifyEntity = await this.repository.findOne({id});
        if (classify === null) { throw new MessageCodeError("update:classify:update"); }
        const array = await this.getClassifyId(id);
        const articles = await this.artRepository.count({where: { classifyId: In (array) }});
        if(articles > 0) {
            return {code: 405, message: "当前分类下有文章,不能删除" };
        }
        await this.repository.delete(array);
        return {code: 200, message: "删除成功" };
    }

    /**
     * 通过id删除页面分类及对应的子分类
     * @param {number} id
     * @returns {Promise<Array<ClassifyEntity>>}
     */
    async deleteMethodSecond(id: number) {
        const classify: PageClassifyEntity = await this.pageRepository.findOne({ id });
        if (classify === null) { throw new MessageCodeError("update:classify:update"); }
        const array = await this.getClassifyIdPage(id);
        const pages = await this.repositoryPage.count({where: { classifyId: In (array)}});
        if(pages > 0){
            return {code: 405, message: "当前分类下有页面,不能删除"};
        }
        await this.pageRepository.delete(array);
        return {code: 200, message: "删除成功" };
    }
    /**
     * 根据id查找文章分类
     * @param {number} id
     * @param {string} useFor
     * @returns {Promise<ClassifyEntity>}
     */
    async findOneArt(id: number): Promise<ClassifyEntity> {
        const entity: ClassifyEntity = await this.repository.findOne({id:id});
        return entity;
    }

    /**
     * 根据id查找页面分类
     * @param {number} id
     * @returns {Promise<PageClassifyEntity>}
     */
    async findOnePage(id: number): Promise<PageClassifyEntity> {
        const entity: PageClassifyEntity = await this.pageRepository.findOne({id});
        return entity;
    }

    /**
     * 显示子级分类文章
     * @param {number} id
     * @returns {Promise<Array<ArticleEntity>>}
     */
    async showNextTitle(id: number) {
        const array = await this.getClassifyId(id);
        result = await this.artRepository.find({
            where: {
                classifyId: In(array.splice(array.findIndex(item => item === id), 1)),
                recycling: false
            },
            relations: ["classify"],
            order: { publishedTime: "DESC"}
        });
        return { articles: result };
    }

    /**
     * 显示上级置顶文章
     * @param {number} id
     * @returns {Promise<Array<ArticleEntity>>}
     */
    async showBeforeTitle(id: number) {
        const classify: ClassifyEntity = await this.repository.findOne(id);
        if (classify === null) { throw new MessageCodeError("page:classify:classifyIdMissing"); }
        const articleArray: Array<ArticleEntity> = [];
        const currentArticle: Array<ArticleEntity> = await this.artRepository
            .find({
                where:{
                    classifyId: classify.parentId,
                    topPlace: "current"
                },
                order: {
                    publishedTime: "DESC"
                }
            });
        articleArray.push(...currentArticle);
        const array: Array<number> = await this.getClassifyId(classify.parentId);
        array.push(id);
        const newArray: Array<number> = Array.from(new Set(array));
        const finalArray: Array<number> = [];
        for (const t in newArray) {
            if (newArray[ t ] !== classify.parentId) {
                finalArray.push(newArray[ t ]);
            }
        }
        const level: number = await this.findLevel(classify.parentId);
        if (level === 1) {
            const newArticles: Array<ArticleEntity> = await this.artRepository
                .find({
                    where:{
                        classifyId: In(newArray),
                        topPlace: "level1"
                    },
                    order: {
                        publishedTime: "DESC"
                    }
                });
            articleArray.push(...newArticles);
        } else if (level === 2) {
            const newArticles = await this.artRepository
                .find({
                    where: {
                        classifyId: In(newArray),
                        topPlace: "level2"
                    },
                    order: {
                        publishedTime: "DESC"
                    }
                });
            articleArray.push(...newArticles);
        } else if (level === 3) {
            const newArticles = await this.artRepository
                .find({
                    where: {
                        classifyId: In(newArray),
                        topPlace: "level3",
                    },
                    order: {publishedTime: "DESC"}
                });
            articleArray.push(...newArticles);
        }
        return { articles: articleArray };
    }

    /**
     * 当前分类文章
     * @param {number} id
     * @returns {Promise<Array<ArticleEntity>>}
     */
    async showCurrentArticles(idNum: number) {
        const classify: ClassifyEntity = await this.repository.findOne({id: idNum});
        if (!classify) { throw new MessageCodeError("page:classify:classifyIdMissing"); }
        result = await this.artRepository.find({
            where: {
                classifyId: idNum,
                recycling: false
            },
            relations: ["classify"],
            order: { publishedTime: "DESC"}
        });
        return { articles: result };
    }

    /**
     * 通过分类id获取文章(包含置顶)
     * @param {number} id
     */
    async getArticelsByClassifyId(id: number, limit?: number, show?: boolean, pages?: number, name?: string) {
        const articles: Array<ArticleEntity> = [];
        const entity: ClassifyEntity = await this.findOneArt(id);
        if (!entity) { throw new MessageCodeError("page:classify:classifyIdMissing"); }
        let level: number = await this.findLevel(entity.id);
        const array: Array<number> = await this.getClassifyId(id).then(a => {
            return a;
        });
        array.push(id);
        const newArray: Array<number> = Array.from(new Set(array));
        /*置顶：无 获取对应关键字或分类 对应的文章,是：获取对应分类下，置顶到1、2 、 3级分类的文章,否：获取对应分类下置顶到4、 5 分类的文章*/
        if (show === true) {
            const global: Array<ArticleEntity> = [];
            const globalArts: Array<ArticleEntity> = await this.artRepository.find({
                where: {
                    classifyId: In(newArray),
                    topPlace: "global",
                    name: Like(`%${ name ? name : "" }%`),
                    recycling: false
                },
                relations: ["classify"],
                order: {publishedTime: "DESC"}
            });
            for (const t in globalArts) {
                if (globalArts[ t ].display !== null) {
                    const newArray: Array<string> = globalArts[ t ].display.split(",");
                    const num: number = newArray.indexOf(id.toString());
                    if (num < 0) {
                        global.push(globalArts[ t ]);
                    }
                } else {
                    global.push(globalArts[ t ]);
                }

            }
            articles.push(...global);
        }
        if (show === false) {
            const newArticles: Array<ArticleEntity> = await this.artRepository.find({
                where: {
                    classifyId: In(newArray),
                    topPlace: Any(["current", "cancel"]),
                    name: Like(`%${ name ? name : "" }%`),
                    recycling: false
                },
                relations: ["classify"],
                order: {publishedTime: "DESC"}

            });
            articles.push(...newArticles);
            level = 5;
        }
        if (show === undefined) {
            level = 4;
        }
        if (level === 1) {
            const newArticles: Array<ArticleEntity> = await this.artRepository.find({
                where: {
                    classifyId: In(newArray),
                    topPlace: "level1",
                    name: Like(`%${ name ? name : "" }%`),
                    recycling: false
                },
                relations: ["classify"],
                order: {publishedTime: "DESC"}
            });
            articles.push(...newArticles);
            const finalArticles: Array<ArticleEntity> = await this.artRepository.find({
                where: {
                    classifyId: id,
                    topPlace: Not("global"),
                    name: Like(`%${ name ? name : "" }%`),
                    recycling: false
                },
                relations: ["classify"],
                order: {publishedTime: "DESC"}
            });
            articles.push(...finalArticles);
        } else if (level === 2) {
            const newArticles = await this.artRepository.find({
                where: {
                    classifyId: In(newArray),
                    topPlace: "level2",
                    name: Like(`%${ name ? name : "" }%`),
                    recycling: false
                },
                relations: ["classify"],
                order: {publishedTime: "DESC"}
            });
            articles.push(...newArticles);
            const finalArticles: Array<ArticleEntity> = await this.artRepository.find({
                where: {
                    classifyId: id,
                    topPlace: Not(Any(["level1", "global"])),
                    name: Like(`%${ name ? name : "" }%`),
                    recycling: false
                },
                relations: ["classify"],
                order: {publishedTime: "DESC"}
            });
            articles.push(...finalArticles);
        } else if (level === 3) {
            const newArticles = await this.artRepository.find({
                where: {
                    classifyId: In(newArray),
                    topPlace: "level3",
                    name: Like(`%${ name ? name : "" }%`),
                    recycling: false
                },
                relations: ["classify"],
                order: {publishedTime: "DESC"}
            });
            articles.push(...newArticles);
            const finalArticles: Array<ArticleEntity> = await this.artRepository.find({
                where: {
                    classifyId: id,
                    topPlace: Not(Any(["level2", "global"])),
                    name: Like(`%${ name ? name : "" }%`),
                    recycling: false
                },
                relations: ["classify"],
                order: {publishedTime: "DESC"}
            });
            articles.push(...finalArticles);
        } else if (level === 4) {
            const newArticles = await this.artRepository.find({
                where: {
                    classifyId: In(newArray),
                    recycling: false,
                    name: Like(`%${ name ? name : ""}%`)
                },
                relations: ["classify"],
                order: {publishedTime: "DESC"}
            });
            articles.push(...newArticles);
        }
        const num: number = articles.length;
        const returnArt: Array<ArticleEntity> = await this.Fenji(articles, limit, pages);
        return { articles: returnArt, totalItems: num };
    }

    async Fenji(art: Array<ArticleEntity>, limit?: number, pages?: number): Promise<Array<ArticleEntity>> {
        let newArt: Array<ArticleEntity> = [];
        if (limit) {
            newArt = art.splice(limit * (
                pages - 1
            ), limit);
        } else {
            newArt = art;
        }
        return newArt;
    }

    /**
     * 文章关键字搜索---对应资讯和活动
     * @returns {Promise<Array<number>>}
     */
    async getClassifyIdForArt() {
        const custom: Array<ClassifyEntity> = await this.repository.createQueryBuilder().where(
            "\"classifyAlias\"=\'活动\' or \"classifyAlias\"=\'资讯\'").getMany();
        let customArray: Array<number> = [];
        for (const t in custom) {
            customArray.push(custom[ t ].id);
            customArray.push(...await this.getClassifyId(custom[ t ].id).then(a => {
                return a;
            }));
        }
        customArray = Array.from(new Set(customArray));
        return customArray;
    }

    /**
     * 获取文章当前分类所有子分类id
     * @param {number} id
     * @returns {Promise<Array<number>>}
     */
    async getClassifyId(idNum: number): Promise<Array<number>> {
        const array: Array<number> = [];
        const manager = getManager();
        const classify = await this.repository.findOne({id: idNum});
        console.log("子级分类id", idNum, classify.id);
        await manager.getTreeRepository(ClassifyEntity).findDescendants(classify).then(a => {if (a) {
            a.map(a => {
               console.log("id", a.id);
            });
        }});

        await manager.getTreeRepository(ClassifyEntity).findDescendants(classify).then(a => {if (a) {
            a.map(a => {
                array.push(a.id);
            });
        }});
        console.log("获取所有子级分类");
        console.log(array);
        return array;
    }

    /**
     * 获取页面当前分类所有子分类id
     * @param {number} id
     * @returns {Promise<Array<number>>}
     */
    async getClassifyIdPage(idNum: number): Promise<Array<number>> {
        const array: Array<number> = [];
        const manager = getManager();
        const classify = await this.pageRepository.findOne({id: idNum});
        await manager.getTreeRepository(PageClassifyEntity).findDescendants(classify).then(a => {if (a) {
            a.map(a => {
                array.push(a.id);
            });
        }});
        return array;
    }

    /**
     * 获取当前分类级别
     * @param {number} id
     * @returns {Promise<void>}
     */
    public async findLevel(id: number): Promise<number> {
        const arr: Array<ClassifyEntity> = await this.repository.find();
        const final: Array<ClassifyEntity> = await this.showClassifyLevel(arr, id, 0);
        let num: number;
        for (const t in final) {
            if (final[ t ].id === 1) {
                num = final[ t ].level;
            }
        }
        return num;
    }

    /**
     * 找出分类级别
     * @param {number} ids
     * @returns {Promise<number>}
     */
    public async showClassifyLevel(arr: Array<ClassifyEntity>, id: number, level: number) {
        const array: Array<ClassifyEntity> = [];
        for (const t in arr) {
            if (arr[ t ].id === id) {
                const newClas: ClassifyEntity = arr[ t ];
                array.push(newClas);
                const arrayCla: Array<ClassifyEntity> = await this.showClassifyLevel(arr, arr[ t ].parentId, level + 1);
                array.push(...arrayCla);

            }
        }
        return array;
    }

    /**
     * 级别转换
     * @param {number} level
     * @returns {string}
     */
    public interfaceChange(level?: number): string {
        let finalLevel: string;
        if (level === 1) {
            finalLevel = "level1";
        } else if (level === 2) {
            finalLevel = "level2";
        } else if (level === 3) {
            finalLevel = "level3";
        } else if (level === 4) {
            finalLevel = "current";
        }
        return finalLevel;
    }

    /**
     * 文章分类移动
     * @param {number} id
     * @param {number} parentId
     * @returns {Promise<Array<ClassifyEntity>>}
     */
    public async mobileClassifyArt(id: number, parentId: number) {
        const classify: ClassifyEntity = await this.repository.findOne({ id});
        if (!classify) { throw new MessageCodeError("update:classify:update"); }
        if (parentId !== 0) {
            const parent: ClassifyEntity = await this.repository.findOne({id: parentId});
            if (!parent) { throw new MessageCodeError("update:classify:update"); }
        }
        if (parentId === 0) {
            parentId = 1;
        }
        const parent: ClassifyEntity = await this.repository.findOne({id: parentId});
        classify.parent = parent;
        classify.parentId = parentId;
        // 当前分类的所有子分类
        const array: Array<number> = await this.getClassifyId(id);
        try {
            // 修改所有文章置顶为当前
            await this.artRepository.update({classifyId: In(array)}, {topPlace: "cancel"});
            await this.repository.save(classify);
        } catch (err) {
            throw new HttpException("mobileClassifyArt:" + err.toString(), 404);
        }
        return {code: 200, message: "修改成功" };
    }

    /**
     * 页面分类移动
     * @param {number} id
     * @param {number} parentId
     * @returns {Promise<Array<ClassifyEntity>>}
     */
    public async mobileClassifyPage(id: number, parentId: number) {
        const classify: PageClassifyEntity = await this.pageRepository.findOne({id});
        if (!classify) { throw new MessageCodeError("update:classify:update"); }
        if (parentId !== 0) {
            const parent: PageClassifyEntity = await this.pageRepository.findOne({id: parentId});
            if (!parent) { throw new MessageCodeError("update:classify:update"); }
        }
        if (parentId === 0) {
            parentId = 1;
        }
        const parent: PageClassifyEntity = await this.pageRepository.findOne({id: parentId});
        classify.parent = parent;
        await this.pageRepository.save(classify);
    }

    /**
     * 根据分类id查找页面分类本身
     * @param {number} id
     * @returns {Promise<PageClassifyEntity>}
     */
    public async findOnePageClassifyById(id: number): Promise<PageClassifyEntity> {
        const final: PageClassifyEntity = await this.pageRepository.findOne({id});
        return final;
    }
    /**
     * 分类批量置顶到全局
     * @param {number} id
     * @returns {Promise<number>}
     */
    async classifyTopPlace(id: number, display?: Array<number>) {
        const entity: ClassifyEntity = await this.repository.findOne(id);
        if (!entity) { throw new MessageCodeError("page:classify:classifyIdMissing"); }
        const array: Array<number> = await this.getClassifyId(id);
        const numArray: Array<number> = [];
        for (const t in display) {
            const array: Array<number> = await this.getClassifyId(display[ t ]);
            const newArray: Array<number> = Array.from(new Set(array));
            numArray.push(...newArray);
        }
        numArray.push(...display);
        const finalArray: Array<number> = Array.from(new Set(numArray));
        try {
            await this.artRepository.update({
                classifyId: In(array),
                topPlace: Not("global")
            },  {
                topPlace: "global",
                display: finalArray.toString()
            });
        } catch (err) {
            throw new HttpException("classifyTopPlace:" + err.toString(), 404);
        }
        return {code: 200, message: "修改成功"};
    }

    /**
     * 获取单个具体分类
     * @param {string} useFor
     * @param {number} id
     * @returns {Promise<{classify: any; MessageCodeError: any}>}
     */
    async findClassifyById(useFor: string, id: number) {
        let result, messageCodeError;
        if (useFor === "art") {
            const entity: ClassifyEntity = await this.repository.findOne({id});
            if (!entity) { messageCodeError = "当前分类不存在"; }
            // 注掉内容不明白原因
            result = entity;/*await this.repository.find({
                where: {id: In([entity.id, entity.parentId])},
                order: {id: "ASC"}
            });*/
        }
        if (useFor === "page") {
            const entity: PageClassifyEntity = await this.pageRepository.findOne({id});
            if (!entity) { messageCodeError = "当前分类不存在"; }
            result = entity;/*await this.pageRepository.find({
                where: {id: In([entity.id, entity.parentId])},
                order: {id: "ASC"}
            });*/
        }
        if (result !== null) {
            messageCodeError = "查找成功";
        }
        return { classifyEntity: [result], MessageCodeError: messageCodeError };
    }

    /**
     *
     * @param {string} useFor
     * @param {number} id
     * @param {string} alias
     * @param {number} deleteNum
     * @returns {Promise<{MessageCodeError: any; Continue: boolean}>}
     */
    async classifyCheck(useFor: string, id?: number, parentId?: number, alias?: string, deleteNum?: number) {
        let result;
        let update = true;
        if (id > 0) {
            if (useFor === "art") {
                const entity: ClassifyEntity = await this.repository.findOne({id});
                if (!entity) { result = "当前文章分类不存在"; }
                update = false;
            } else {
                const entity: PageClassifyEntity = await this.pageRepository.findOne({id});
                if (!entity) { result = "当前页面分类不存在"; }
                update = false;
            }
        }
        if (parentId > 0) {
            if (useFor === "art") {
                const entityAll: Array<ClassifyEntity> = await this.repository.find();
                if (entityAll.length > 0) {
                    const entity: ClassifyEntity = await this.repository.findOne({id: parentId});
                    if (!entity) { result = "当前文章分类父级分类不存在"; }
                    update = false;
                }

            } else {
                const entityAll: Array<PageClassifyEntity> = await this.pageRepository.find();
                if (entityAll.length > 0) {
                    const entity: PageClassifyEntity = await this.pageRepository.findOne({id: parentId});
                    if (!entity) { result = "当前页面分类父级分类不存在"; }
                    update = false;
                }
            }
        }
        if (alias) {
            if (useFor === "art") {
                if (id) {/*修改文章分类*/
                    const classify: ClassifyEntity = await this.repository.findOne({id});
                    if (classify.classifyAlias !== alias) {
                        const count = await this.repository.count({
                            classifyAlias: alias
                        });
                        if (count > 0) { result = "别名不能重复"; }
                        update = false;
                    }
                } else {/*增加文章分类*/
                    const count = await this.repository.count({
                        classifyAlias: alias
                    });
                    if (count > 0) { result = "别名不能重复"; }
                    update = false;
                }

            } else {
                if (id) {/*修改页面分类*/
                    const entity: PageClassifyEntity = await this.pageRepository.findOne({id});
                    if (entity.classifyAlias !== alias) {
                        const count = await this.pageRepository.count({
                            classifyAlias: alias
                        });
                        if (count > 0) { result = "别名不能重复"; }
                        update = false;
                    }
                } else {/*添加页面分类*/
                    const count = await this.pageRepository.count({
                        classifyAlias: alias
                    });
                    if (count > 0) { result = "别名不能重复"; }
                    update = false;
                }

            }
        }
        if (deleteNum > 0) {
            if (useFor === "art") {
                const entity = await this.repository.findOne(deleteNum);
                if (!entity) {
                    result = "当前分类不存在";
                    update = false;
                } else {
                    const array: Array<number> = await this.getClassifyId(deleteNum);
                    const articles = await this.artRepository.count({where: {classifyId: In(array)}});
                    if (articles > 0) { result = "当前分类下有文章,不能删除"; }
                    update = false;
                }

            } else {
                const entity = await this.pageRepository.findOne(deleteNum);
                if (!entity) {
                    result = "当前分类不存在";
                    update = false;
                } else {
                    const array: Array<number> = await this.getClassifyIdPage(deleteNum);
                    const pages = await this.repositoryPage.count({where: {classifyId: In(array)}});
                    if (pages > 0) { result = "当前分类下有页面,不能删除"; }
                    update = false;
                }
            }
        }
        if (!result) {
            update = true;
        }

        return { MessageCodeError: result, Continue: update };
    }

    /**
     * 获取上级分类
     * @param {number} id
     * @returns {Promise<Array<ClassifyEntity>>}
     */
    async getParentClassify(id: number) {
        const entityAll: Array<ClassifyEntity> = [];
        const current = await this.repository.findOne({id});
        if (!current) {
            return  { code: 200, message: "当前分类不存在" };
        }
        const manage = getManager();
        result = await manage.getTreeRepository(ClassifyEntity).findAncestorsTree(current);
        entityAll.push(result);
        return entityAll;
    }
}
