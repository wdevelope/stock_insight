import { BadRequestException, Injectable } from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardsRepository } from 'src/boards/boards.repository';
import { Users } from 'src/users/users.entity';
import { Board } from 'src/boards/entities/board.entity';
import { CommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private boardsRepository: BoardsRepository,
  ) {}

  async findBoard(boardId: number): Promise<any | undefined> {
    try {
      const board = await this.boardsRepository.findOne({
        where: { id: boardId },
      });
      return board;
    } catch (error) {
      throw new BadRequestException('REPOSITORY_ERROR');
    }
  }

  async find(option: FindOneOptions<Comment>): Promise<Comment[] | undefined> {
    try {
      return await this.commentsRepository.find(option);
    } catch (error) {
      throw new BadRequestException('REPOSITORY_ERROR');
    }
  }

  async findOne(option: FindOneOptions<Comment>): Promise<Comment | undefined> {
    try {
      return this.commentsRepository.findOne(option);
    } catch (error) {
      throw new BadRequestException('REPOSITORY_ERROR');
    }
  }

  async save(user: Users, commentDto: CommentDto, board: Board): Promise<void> {
    try {
      await this.commentsRepository.save({
        comment: commentDto.comment,
        board: board,
        user: user,
      });
    } catch (error) {
      throw new BadRequestException('REPOSITORY_ERROR');
    }
  }

  async update(commentDto: CommentDto, commentId: number): Promise<void> {
    try {
      await this.commentsRepository
        .createQueryBuilder()
        .update(Comment)
        .set({
          comment: commentDto.comment,
        })
        .where('id=:id', { id: commentId })
        .execute();
    } catch (error) {
      throw new BadRequestException('REPOSITORY_ERROR');
    }
  }

  async remove(existedcomment): Promise<void> {
    try {
      await this.commentsRepository.manager.transaction(async (transaction) => {
        await transaction.remove(existedcomment);
      });
    } catch (error) {
      throw new BadRequestException('REPOSITORY_ERROR');
    }
  }
}