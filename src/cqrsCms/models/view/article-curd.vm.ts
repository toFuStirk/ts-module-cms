import { ArticleEntity } from "../../../entity/article.entity";

export class ArticleCurdVm {
    /*新增文章*/
    public createArticle?: { article: ArticleEntity, url: any };

    /*修改文章*/
    public updateArticle?: { article: ArticleEntity, url: any };

    /*放入回收站*/
    public deleteById?: Array<number>;

    /*回收站删除*/
    public recycleDelete?: Array<number>;

    /*回收站还原*/
    public reductionArticle?: Array<number>;

    /*获取所有文章*/
    public getAllArticles?: boolean;

    /*每页条数*/
    public limitNum?: number;

    /*第几页*/
    public pages?: number;

    /*查找文章*/
    public getArticles?: {
        getArticleAll?: boolean, recycleFind?: boolean,
        reductionGetByClassifyId?: number, getArticleByClassifyId?: { classifyId: number, top: boolean, name?: string }, findTopPlace?: boolean,
        showNext?: number, getArticleById?: number, superiorArticle?: number, getCurrentClassifyArticles?: number,
        hidden?: boolean, findTopPlace3?: { classifyId: number, top: boolean }, keywordSearch?: { keywords: string }
    };

    /*图片本地上传*/
    public pictureUpload?: { id?: number, bucketName: string, rawName: string, base64: string, url: any };

    /*是否隐藏*/
    public hidden?: boolean;
}
