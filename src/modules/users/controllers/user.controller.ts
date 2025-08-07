import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UserResponseDto } from "../dtos/response/user-response.dto";
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @ApiOperation({
        summary: 'Get all users',
        description: 'Retrieve a paginated list of users'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
        example: 1
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 10)',
        example: 10
    })
    @ApiOkResponse({
        description: 'Users retrieved successfully',
        type: PaginatedResponseDto<UserResponseDto>
    })
    @ApiBadRequestResponse({
        description: 'Invalid query parameters'
    })
    findAll(@Query() queryParams: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>> {
        return this.userService.findAll(queryParams);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new user',
        description: 'Create a new user with the provided information'
    })
    @ApiBody({
        type: CreateUserDto,
        description: 'User creation data',
        examples: {
            example1: {
                summary: 'Basic user creation',
                description: 'Example of creating a basic user',
                value: {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    password: 'SecurePassword123!'
                }
            }
        }
    })
    @ApiCreatedResponse({
        description: 'User created successfully',
        type: UserResponseDto
    })
    @ApiConflictResponse({
        description: 'User with this email already exists'
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data'
    })
    create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
        return this.userService.create(data);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete a user',
        description: 'Soft delete a user by their ID'
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'User ID',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @ApiNoContentResponse({
        description: 'User deleted successfully'
    })
    @ApiNotFoundResponse({
        description: 'User not found or already deleted'
    })
    @ApiBadRequestResponse({
        description: 'Invalid user ID format'
    })
    remove(@Param('id') id: string): Promise<void> {
        return this.userService.remove(id);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their ID'
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'User ID',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @ApiOkResponse({
        description: 'User retrieved successfully',
        type: UserResponseDto
    })
    @ApiNotFoundResponse({
        description: 'User not found'
    })
    @ApiBadRequestResponse({
        description: 'Invalid user ID format'
    })
    findOne(@Param('id') id: string): Promise<UserResponseDto | null> {
        return this.userService.findOne(id);
    }
}