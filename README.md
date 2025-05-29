# 프론트엔드 배포 파이프라인

## 개요

GitHub Actions 워크플로우를 통해 Next.js 프론트엔드 애플리케이션을 AWS 클라우드 인프라에 자동 배포하는 파이프라인을 구축했습니다. Blue-Green 배포 전략을 적용하여 무중단 배포를 지원하며, CloudFront CDN을 통해 전 세계 사용자에게 빠른 콘텐츠 전송을 제공합니다.

## 아키텍처 다이어그램

![architecture](./assets/architecture.png)

## 배포 파이프라인 단계

GitHub Actions 워크플로우는 다음과 같은 단계로 진행됩니다:

### 1. 사전 작업

- Ubuntu 최신 버전 환경 설정
- Node.js 및 npm 환경 구성

### 2. 코드 준비 및 빌드

- **Checkout**: 액션을 사용해 GitHub 저장소에서 소스 코드 다운로드
- **의존성 설치**: `npm ci` 명령어로 package-lock.json 기반 정확한 의존성 설치
- **프로젝트 빌드**: `npm run build` 명령어로 Next.js 프로젝트 프로덕션 빌드 수행

### 3. AWS 인프라 배포

- **AWS 자격 증명 구성**: Repository Secrets를 통한 안전한 AWS 액세스 설정
- **S3 동기화**: 빌드된 정적 파일들을 Blue-Green 환경의 S3 버킷에 업로드
- **CloudFront 배포**: CDN을 통한 전역 콘텐츠 배포
- **캐시 무효화**: CloudFront 엣지 로케이션의 기존 캐시 삭제로 최신 콘텐츠 반영

### 4. DNS 및 도메인 설정

- **Route 53**: 외부 도메인 등록업체(가비아 등)에서 구매한 도메인의 네임서버를 Route 53으로 변경
- **DNS 라우팅**: 지연 시간 기반 라우팅 및 헬스 체크 설정
- **SSL/TLS 인증서**: AWS Certificate Manager(ACM)에서 도메인용 SSL 인증서 발급 및 CloudFront에 연결

### 5. 모니터링 및 알림

- **CloudWatch**: 애플리케이션 성능 및 오류 모니터링
- **SNS**: 배포 상태 및 시스템 알림 전송

## 주요 링크

- **S3 버킷 웹사이트 엔드포인트**:
  - **한국 리전**: `http://s3.min71.dev.s3-website.ap-northeast-2.amazonaws.com`
  - **미국 리전**: `http://hanghae-usa.s3-website-us-east-1.amazonaws.com`
- **CloudFront 배포 도메인 이름**:
  - **Route53 연결 도메인**: `https://prod.min71.dev`
  - **CloudFront**: `https://d2bw6fzzfn3dq3.cloudfront.net`
- **모니터링 대시보드**:
  - CloudWatch 콘솔: `AWS Console > CloudWatch > Dashboards`
  - 알림 설정: `AWS Console > SNS > Topics`

## 주요 개념

### GitHub Actions과 CI/CD 도구

GitHub에서 제공하는 클라우드 기반 CI/CD 플랫폼으로, 코드 변경사항을 자동으로 감지하여 빌드, 테스트, 배포까지의 전체 프로세스를 자동화합니다. YAML 파일로 워크플로우를 정의하며, 다양한 이벤트(push, pull request 등)에 반응하여 실행됩니다.

### S3와 스토리지

Amazon Simple Storage Service(S3)는 확장 가능한 객체 스토리지 서비스입니다. 정적 웹사이트 호스팅 기능을 제공하여 HTML, CSS, JavaScript 파일들을 저장하고 웹에서 직접 서빙할 수 있습니다.

### CloudFront와 CDN

Amazon CloudFront는 전 세계에 분산된 엣지 로케이션을 통해 콘텐츠를 캐싱하고 배포하는 CDN(Content Delivery Network) 서비스입니다. 사용자에게 가장 가까운 엣지 로케이션에서 콘텐츠를 제공하여 지연 시간을 최소화하고 전송 속도를 향상시킵니다.

### 캐시 무효화(Cache Invalidation)

CDN에 캐시된 기존 콘텐츠를 강제로 삭제하여 새로운 콘텐츠가 즉시 반영되도록 하는 과정입니다. 배포 후 사용자가 최신 버전의 애플리케이션에 접근할 수 있도록 보장하는 중요한 단계입니다. CloudFront에서는 특정 파일 경로나 와일드카드 패턴을 지정하여 무효화할 수 있습니다.

### AWS Certificate Manager(ACM)와 SSL 인증서

AWS Certificate Manager는 SSL/TLS 인증서를 무료로 프로비저닝, 관리 및 배포할 수 있는 서비스입니다. Vercel과 별도로 AWS에서는 HTTPS를 위해 수동으로 인증서를 발급받아야 합니다. ACM에서 발급받은 인증서는 CloudFront에 연결되어 사용자와 CDN 간의 통신을 암호화합니다.

### Route 53과 DNS

Amazon Route 53은 확장 가능한 클라우드 DNS(Domain Name System) 웹 서비스입니다. 사용자가 기억하기 쉬운 도메인 이름(예: www.example.com)을 CloudFront 배포의 실제 주소로 변환해줍니다. 지연 시간 기반 라우팅, 가중치 기반 라우팅, 지리적 라우팅 등 다양한 라우팅 정책을 지원하여 최적의 사용자 경험을 제공합니다.

### Repository Secret과 환경변수

GitHub Repository에서 제공하는 암호화된 환경변수 저장소입니다. AWS 액세스 키, 시크릿 키 등의 민감한 정보를 안전하게 저장하고 GitHub Actions 워크플로우에서 사용할 수 있습니다. 코드에 하드코딩하지 않고도 안전하게 인증 정보를 관리할 수 있습니다.

### CloudWatch와 모니터링

Amazon CloudWatch는 AWS 리소스와 애플리케이션을 실시간으로 모니터링하는 서비스입니다. 메트릭 수집, 로그 관리, 대시보드 생성, 알람 설정 기능을 제공합니다. CloudFront, S3, Lambda 등의 성능 지표를 추적하여 시스템 상태를 파악하고, 임계값 초과 시 자동으로 알림을 발송할 수 있습니다.

### SNS와 알림 시스템

Amazon Simple Notification Service(SNS)는 완전 관리형 메시징 서비스입니다. 애플리케이션 간, 사용자 간 메시지 전송을 지원하며, 이메일, SMS, HTTP 엔드포인트 등 다양한 방식으로 알림을 보낼 수 있습니다. CloudWatch 알람과 연동하여 배포 실패, 성능 저하, 오류 발생 시 즉시 개발팀에 알림을 전송합니다.

## Blue-Green 배포 전략

Blue-Green 배포는 두 개의 동일한 프로덕션 환경(Blue, Green)을 운영하여 무중단 배포를 실현하는 전략입니다:

- **Blue 환경**: 현재 운영 중인 프로덕션 환경
- **Green 환경**: 새 버전이 배포될 스테이징 환경
- **전환 과정**: Green 환경에서 테스트 완료 후 트래픽을 즉시 전환
- **장점**: 즉시 롤백 가능, 배포 위험 최소화, 사용자 서비스 중단 없음

## 보안 고려사항

- AWS IAM 역할 기반 최소 권한 원칙 적용
- Repository Secrets를 통한 자격 증명 암호화 저장
- S3 버킷 퍼블릭 액세스 차단 및 CloudFront를 통한 제한적 접근
- HTTPS 강제 적용으로 데이터 전송 암호화

## 성능 최적화

- CloudFront CDN을 통한 글로벌 콘텐츠 캐싱
- S3 Transfer Acceleration 활용한 업로드 속도 향상
- 적절한 캐시 정책 설정으로 사용자 경험 개선
- CloudWatch를 통한 실시간 성능 모니터링

## DNS 및 SSL 인증서 관리

### 외부 도메인 연결 (가비아 → AWS)

기존에 가비아에서 구매한 도메인을 AWS로 연결하는 과정:

1. **Route 53 호스팅 영역 생성**: AWS에서 도메인용 호스팅 영역 생성
2. **네임서버 변경**: 가비아 도메인 설정에서 네임서버를 Route 53의 네임서버로 변경
3. **DNS 레코드 설정**: A 레코드 또는 CNAME을 CloudFront 배포 도메인으로 설정

### SSL 인증서 설정 (Vercel vs AWS)

- **Vercel**: 도메인 연결 시 Let's Encrypt 인증서 자동 발급 및 갱신
- **AWS**: Certificate Manager에서 수동 발급 필요, 하지만 무료이며 자동 갱신 지원

### SSL 인증서 발급 과정

1. **ACM에서 인증서 요청**: 도메인 소유권 검증 방식 선택 (DNS 또는 이메일)
2. **도메인 검증**: Route 53에 CNAME 레코드 추가로 소유권 증명
3. **CloudFront 연결**: 발급된 인증서를 CloudFront 배포의 Alternate Domain Names에 연결
4. **HTTPS 강제**: HTTP 요청을 HTTPS로 리다이렉트 설정

## DNS 및 도메인 관리

Route 53을 통한 도메인 관리는 다음과 같은 이점을 제공합니다:

- **사용자 친화적 URL**: CloudFront 배포 도메인 대신 브랜드 도메인 사용
- **SSL/TLS 인증서**: AWS Certificate Manager와 연동하여 HTTPS 자동 적용
- **헬스 체크**: 엔드포인트 상태 모니터링 및 자동 페일오버
- **다양한 라우팅 정책**: 성능, 지리적 위치, 가중치 기반 트래픽 분산

### Vercel vs AWS 배포 비교

| 구분            | Vercel                         | AWS                                  |
| --------------- | ------------------------------ | ------------------------------------ |
| **도메인 연결** | 간단한 UI에서 도메인 추가      | Route 53 호스팅 영역 + 네임서버 변경 |
| **SSL 인증서**  | 자동 발급/갱신 (Let's Encrypt) | ACM에서 수동 발급 (무료, 자동 갱신)  |
| **CDN**         | 내장 Edge Network              | CloudFront 별도 설정                 |
| **설정 복잡도** | 낮음                           | 높음 (더 많은 제어 가능)             |
| **비용**        | 사용량 기반                    | 세부 서비스별 과금                   |

---

**참고**: 가비아에서 구매한 도메인을 AWS로 이전하는 경우, 네임서버 변경 후 DNS 전파에 최대 48시간이 소요될 수 있습니다. SSL 인증서 검증도 DNS 레코드 추가 후 몇 분에서 몇 시간 정도 걸릴 수 있습니다.
