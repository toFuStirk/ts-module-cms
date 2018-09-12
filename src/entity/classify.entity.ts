import {
    Column,
    Entity,
    OneToMany, Tree, TreeChildren, TreeParent
} from "typeorm";
import { ArticleEntity } from "./article.entity";
import { AbstractFile } from "./abstract.file";

@Entity("article_classify_table")
@Tree("nested-set")
export class ClassifyEntity extends AbstractFile {
    /*是否显示当前分类文章*/
    @Column({
        nullable: true,
    })
    isCurrentType: boolean;

    /*是否显示子级分类文章*/
    @Column({
        nullable: true,
    })
    isChildType: boolean;

    /*是否显示全局置顶文章*/
    @Column({
        nullable: true,
    })
    isAllTop: boolean;

    /*是否显示上级置顶文章*/
    @Column({
        nullable: true,
    })
    isPreTop: boolean;

    @TreeChildren()
    children: Array<ClassifyEntity>;

    @TreeParent()
    parent: ClassifyEntity;

    @OneToMany(
        type => ArticleEntity,
        articleEntity => articleEntity.classify,
    )
    articles: Array<ArticleEntity>;
}
