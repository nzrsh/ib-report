import {
  IsString,
  IsOptional,
  IsDate,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,              // ← ограничение 1..10
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IncidentType,
  NegativeImpact,
  ViolatorMotivation,
  ViolatorType,
  IncidentReality,   
  IncidentIntent,      
  NegativePointer,    
} from '@prisma/client';

// DTO для создания инцидента
export class CreateIncidentDto {
  @IsOptional()
  incidentDate?: string;

  @IsOptional()
  @IsString()
  incidentNumber?: string;

  @IsOptional()
  @IsString()
  operationSurname?: string;

  @IsOptional()
  @IsString()
  operationAddress?: string;

  @IsOptional()
  @IsString()
  operationPhone?: string;

  @IsOptional()
  @IsString()
  operationEmail?: string;

  @IsOptional()
  @IsString()
  griibSurname?: string;

  @IsOptional()
  @IsString()
  griibAddress?: string;

  @IsOptional()
  @IsString()
  griibPhone?: string;

  @IsOptional()
  @IsString()
  griibEmail?: string;

  @IsOptional()
  @IsString()
  whatHappened?: string;

  @IsOptional()
  @IsString()
  howHappened?: string;

  @IsOptional()
  @IsString()
  whyHappened?: string;

  @IsOptional()
  @IsString()
  affectedComponents?: string;

  @IsOptional()
  @IsString()
  businessImpact?: string;

  @IsOptional()
  @IsString()
  identifiedVulnerabilities?: string;

  @IsOptional()
  startDateTime?: string;

  @IsOptional()
  detectDateTime?: string;

  @IsOptional()
  reportDateTime?: string;

  @IsOptional()
  @IsBoolean()
  isIncidentResolved?: boolean;

  @IsOptional()
  @IsEnum(IncidentType)
  incidentType?: IncidentType;

  @IsOptional()
  @IsString()
  information?: string;

  @IsOptional()
  @IsString()
  hardware?: string;

  @IsOptional()
  @IsString()
  software?: string;

  @IsOptional()
  @IsString()
  communicationMeans?: string;

  @IsOptional()
  @IsString()
  documentation?: string;

  @IsOptional()
  @IsEnum(NegativeImpact)
  negativeImpact?: NegativeImpact;

  @IsOptional()
  investigationStartDate?: string;

  @IsOptional()
  @IsString()
  investigators?: string;

  @IsOptional()
  incidentEndDate?: string;

  @IsOptional()
  impactEndDate?: string;

  @IsOptional()
  investigationEndDate?: string;

  @IsOptional()
  @IsString()
  investigationReportLocation?: string;

  @IsOptional()
  @IsEnum(ViolatorType)
  violatorType?: ViolatorType;

  @IsOptional()
  @IsString()
  violatorDescription?: string;

  @IsOptional()
  @IsEnum(ViolatorMotivation)
  violatorMotivation?: ViolatorMotivation;

  @IsOptional()
  @IsString()
  resolutionActions?: string;

  @IsOptional()
  @IsString()
  plannedResolutionActions?: string;

  @IsOptional()
  @IsString()
  otherActions?: string;

  @IsOptional()
  @IsEnum(IncidentReality)
  typeOption1?: IncidentReality;

  @IsOptional()
  @IsEnum(IncidentIntent)
  typeOption2?: IncidentIntent;

  @IsOptional()
  @IsString()
  negativeNumber?: string;

  @IsOptional()
  @IsEnum(NegativePointer)
  negativePointer?: NegativePointer;

  @IsOptional()
  @IsString()
  negativeIssues?: string;
}

export class PaginationIncident {
  skip: string;
  take: string;
  type?: IncidentType;
}

export class UpdateIncidentDto extends CreateIncidentDto {}
