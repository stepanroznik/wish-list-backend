export abstract class BaseMapper<
    TCreateDto = any,
    TUpdateDto = any,
    TViewDto = any,
    TCreationAttributes = any,
    TAttributes = any,
    TModel = any,
> {
    abstract fromDto(dto: TCreateDto): TCreationAttributes;
    abstract fromDto(dto: TUpdateDto): Partial<TAttributes>;
    abstract fromDto(dto: TCreateDto | TUpdateDto);
    abstract toDto(inst: TModel): TViewDto;

    fromDtoArray(dtos: TCreateDto[]): TCreationAttributes[] {
        return dtos.map((dto) => this.fromDto(dto));
    }

    toDtoArray(insts: TModel[]): TViewDto[] {
        return insts.map((inst) => this.toDto(inst));
    }
}
