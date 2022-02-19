import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
    ParseBoolPipe,
    NotFoundException,
    UseGuards,
} from '@nestjs/common';
import { WishListService } from './wish-list.service';
import { CreateWishListDto } from './dto/create-wish-list.dto';
import { UpdateWishListDto } from './dto/update-wish-list.dto';
import { ArrayValidationPipe } from '../common/pipes/array-validation.pipe';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { LoggerService } from '../common/logger/logger.service';
import { WishListMapper } from './wish-list.mapper';
import { WhereParserService } from '../common/where-parser/where-parser.service';
import {
    forceQuery,
    FORCE_QUERY,
    includeDeletedArrayQuery,
    includeDeletedQuery,
    INCLUDE_DELETED_ARRAY_QUERY,
    INCLUDE_DELETED_QUERY,
    restoreQuery,
    RESTORE_QUERY,
    whereQuery,
    WHERE_QUERY,
} from '../common/openapi/query.openapi';
import { idParam } from '../common/openapi/params.openapi';
import { ApiKeyGuard } from '../common/api-key.guard';
@ApiTags('Parties')
@Controller('parties')
export class WishListController {
    constructor(
        private readonly wishListService: WishListService,
        private readonly wishListMapper: WishListMapper,
        private readonly whereParser: WhereParserService,
        private logger: LoggerService,
    ) {
        this.logger.setContext(WishListController.name);
    }

    @Post()
    @UseGuards(ApiKeyGuard)
    @ApiBody({ type: [CreateWishListDto] })
    @ApiOperation({
        summary: 'Creates parties',
    })
    async create(
        @Body(ArrayValidationPipe(CreateWishListDto))
        createWishListDtos: CreateWishListDto[],
    ) {
        const result = await this.wishListService.create(
            this.wishListMapper.fromDtoArray(createWishListDtos),
        );
        return this.wishListMapper.toDtoArray(result);
    }

    @Get()
    @ApiOperation({
        summary: 'Finds all parties',
    })
    @ApiQuery(whereQuery)
    @ApiQuery(includeDeletedArrayQuery)
    async findAll(
        @Query(WHERE_QUERY) where: any,
        @Query(INCLUDE_DELETED_ARRAY_QUERY, ParseBoolPipe)
        includeDeleted: boolean,
        @Query('include-answers', ParseBoolPipe)
        includeAnswers: boolean,
    ) {
        const parties = await this.wishListService.findAll({
            where: where ? this.whereParser.parseWhereObject(where) : null,
            includeDeleted,
            includeAnswers,
        });
        return this.wishListMapper.toDtoArray(parties);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Finds a single wishList by id',
    })
    @ApiParam(idParam)
    @ApiQuery(includeDeletedQuery)
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query(INCLUDE_DELETED_QUERY, ParseBoolPipe) includeDeleted: boolean,
    ) {
        const wishList = await this.wishListService.findOne(id, {
            includeDeleted,
        });
        return this.wishListMapper.toDto(wishList);
    }

    @Put(':id')
    @UseGuards(ApiKeyGuard)
    @ApiOperation({
        summary: 'Updates a single wishList by id',
    })
    @ApiParam(idParam)
    @ApiQuery(restoreQuery)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Query(RESTORE_QUERY, ParseBoolPipe) restore: boolean,
        @Body() updateWishListDto: UpdateWishListDto,
    ) {
        const wishList = await this.wishListService.update(
            id,
            this.wishListMapper.fromDto(updateWishListDto),
            {
                restore,
            },
        );
        return this.wishListMapper.toDto(wishList);
    }

    @Delete(':id')
    @UseGuards(ApiKeyGuard)
    @ApiOperation({
        summary: 'Deletes a single wishList by id',
    })
    @ApiParam(idParam)
    @ApiQuery(forceQuery)
    async remove(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query(FORCE_QUERY, ParseBoolPipe) force: boolean,
    ) {
        try {
            return await this.wishListService.remove(id, { force });
        } catch (e) {
            if (e instanceof NotFoundException) {
                return;
            }
            throw e;
        }
    }
}
