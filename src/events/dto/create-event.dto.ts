// dto/create-event.dto.ts
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateEventDto {
  @IsString()
  date: string;

  @IsString()
  number: string;

  @IsString()
  @IsOptional()
  surname?: string;

  @IsString()
  address: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  mail?: string;

  @IsString()
  happened: string;

  @IsString()
  @IsOptional()
  happenedCause?: string;

  @IsString()
  rootCause: string;

  @IsString()
  affectedComponents: string;

  @IsString()
  businessImpact: string;

  @IsString()
  identifiedVulnerabilities: string;

  @IsBoolean()
  isEventResolved: boolean;

  @IsString()
  @IsOptional()
  eventDuration?: string;

  @IsString()
  @IsOptional()
  start?: string;

  @IsString()
  @IsOptional()
  detect?: string;

  @IsString()
  @IsOptional()
  end?: string;

  @IsOptional()
  @IsString()
  organization?: string;
}

export class PaginationEvents {
  skip: string;
  take: string;
}
