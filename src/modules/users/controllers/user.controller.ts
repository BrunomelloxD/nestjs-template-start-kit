import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UserResponseDto } from "../dtos/response/user-response.dto";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    findAll(@Query() queryParams: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>> {
        return this.userService.findAll(queryParams);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
        return this.userService.create(data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string): Promise<void> {
        return this.userService.remove(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<UserResponseDto | null> {
        return this.userService.findOne(id);
    }
}