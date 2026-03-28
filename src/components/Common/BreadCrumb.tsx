import Link from "next/link"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

const BreadCrumb = ({ breadCrumb }: { breadCrumb?: Array<{ position: number; name: string; slug?: string; isCurrent: boolean }> }) => {
    return (
        !!breadCrumb?.length && (
            <Breadcrumb className="mt-3">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={'/'}>Trang chủ</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    {breadCrumb
                        .slice()
                        .sort((a, b) => a.position - b.position)
                        .map((item, idx, arr) => (
                            <div key={`${item.position}-${item.name}`} className="contents">
                                <BreadcrumbItem>
                                    {item.isCurrent || !item.slug ? (
                                        <BreadcrumbPage>{item.name}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={item.slug}>{item.name}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {idx < arr.length - 1 && <BreadcrumbSeparator />}
                            </div>
                        ))}
                </BreadcrumbList>
            </Breadcrumb>
        )

    )
}

export default BreadCrumb