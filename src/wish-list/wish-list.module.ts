import { Module } from '@nestjs/common';
import { WishListService } from './wish-list.service';
import { WishListController } from './wish-list.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { WishList } from './entities/wish-list.entity';
import { WishListMapper } from './wish-list.mapper';
import { WhereParserModule } from '../common/where-parser/where-parser.module';

@Module({
    imports: [SequelizeModule.forFeature([WishList]), WhereParserModule],
    exports: [WishListMapper],
    controllers: [WishListController],
    providers: [WishListService, WishListMapper],
})
export class WishListModule {}
