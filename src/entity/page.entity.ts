import {
    Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { PageContentEntity } from "./page.content.entity";
import { PageClassifyEntity } from "./pageClassify.entity";

@Entity("page_entity_table")
export class PageEntity {
    /*页面id*/
    @PrimaryGeneratedColumn()
    id: number;

    /*页面标题*/
    @Column({
        length: 200,
    })
    title: string;

    /*页面别名*/
    @Column({
        length: 200,
        nullable: true,
    })
    alias: string;

    /*页面分类Id*/
    @Column({
        nullable: true,
    })
    classifyId: number;

    /*创建时间*/
    @CreateDateColumn()
    createAt: Date;

    /*修改时间*/
    @UpdateDateColumn()
    updateAt: Date;

    /*无用*/
    @Column({
        default: false,
    })
    check: boolean;

    /*页面内容*/
    @OneToMany(
        type => PageContentEntity,
        pageContentEntity => pageContentEntity.page, {
            cascade:  ["insert", "update"],
            lazy: false,
            eager: false
        }
    )
    contents: Array<PageContentEntity>;

    /*分类*/
    @ManyToOne(
        type => PageClassifyEntity,
        pageClassifyEntity => pageClassifyEntity.pages,
    )
    @JoinColumn({
        name: "classifyId",
        referencedColumnName: "id"
    })
    classify: Array<PageClassifyEntity>;
}
